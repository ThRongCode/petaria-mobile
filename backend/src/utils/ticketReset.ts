import { PrismaService } from '../prisma/prisma.service';
import { ConfigLoaderService } from '../config/config-loader.service';

/**
 * Time-based ticket regeneration utility.
 *
 * Instead of a hard daily reset, tickets regenerate over time:
 *   Hunt:   1 ticket every 3 hours (configurable), cap at 5
 *   Battle: 1 ticket every 1 hour (configurable), cap at 20
 *
 * On any API call that touches tickets, we compute how many have regenerated
 * since the last regen timestamp, clamp to max, update the DB, and return
 * the current count + next-regen timestamp.
 */

export interface TicketRegenResult {
  huntTickets: number;
  battleTickets: number;
  maxHuntTickets: number;
  maxBattleTickets: number;
  /** ISO timestamp when the next hunt ticket will be available (null if full) */
  nextHuntTicketAt: string | null;
  /** ISO timestamp when the next battle ticket will be available (null if full) */
  nextBattleTicketAt: string | null;
  /** Minutes per hunt ticket regen */
  huntRegenMinutes: number;
  /** Minutes per battle ticket regen */
  battleRegenMinutes: number;
}

function getConfig() {
  const loader = ConfigLoaderService.getInstance();
  const gc = loader?.getGameConstants();
  return {
    maxHunt: gc?.tickets?.maxHuntTickets ?? 5,
    maxBattle: gc?.tickets?.maxBattleTickets ?? 20,
    huntRegenMin: gc?.tickets?.huntRegenMinutes ?? 180,
    battleRegenMin: gc?.tickets?.battleRegenMinutes ?? 60,
  };
}

/**
 * Calculate how many tickets have regenerated since `lastRegen`,
 * and what the new lastRegen timestamp should be.
 */
function computeRegen(
  currentTickets: number,
  maxTickets: number,
  lastRegen: Date,
  regenMinutes: number,
  now: Date,
): { tickets: number; newLastRegen: Date } {
  if (currentTickets >= maxTickets) {
    return { tickets: maxTickets, newLastRegen: now };
  }

  const elapsedMs = now.getTime() - lastRegen.getTime();
  const elapsedMinutes = elapsedMs / (1000 * 60);
  const ticketsEarned = Math.floor(elapsedMinutes / regenMinutes);

  if (ticketsEarned <= 0) {
    return { tickets: currentTickets, newLastRegen: lastRegen };
  }

  const newTickets = Math.min(currentTickets + ticketsEarned, maxTickets);
  // Advance lastRegen by the number of tickets actually earned (not clamped extras)
  const ticketsActuallyAdded = newTickets - currentTickets;
  const newLastRegen = new Date(lastRegen.getTime() + ticketsActuallyAdded * regenMinutes * 60 * 1000);

  return { tickets: newTickets, newLastRegen };
}

function getNextTicketAt(
  currentTickets: number,
  maxTickets: number,
  lastRegen: Date,
  regenMinutes: number,
): string | null {
  if (currentTickets >= maxTickets) return null;
  return new Date(lastRegen.getTime() + regenMinutes * 60 * 1000).toISOString();
}

export class TicketResetUtil {
  /**
   * Regenerate tickets based on elapsed time, update DB, return current state.
   * Call this before any operation that reads or consumes tickets.
   */
  static async checkAndResetTickets(
    prisma: PrismaService,
    userId: string,
  ): Promise<TicketRegenResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        huntTickets: true,
        battleTickets: true,
        lastHuntTicketRegen: true,
        lastBattleTicketRegen: true,
      },
    });

    if (!user) throw new Error('User not found');

    const cfg = getConfig();
    const now = new Date();

    const hunt = computeRegen(user.huntTickets, cfg.maxHunt, user.lastHuntTicketRegen, cfg.huntRegenMin, now);
    const battle = computeRegen(user.battleTickets, cfg.maxBattle, user.lastBattleTicketRegen, cfg.battleRegenMin, now);

    const huntChanged = hunt.tickets !== user.huntTickets;
    const battleChanged = battle.tickets !== user.battleTickets;

    if (huntChanged || battleChanged) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(huntChanged && { huntTickets: hunt.tickets, lastHuntTicketRegen: hunt.newLastRegen }),
          ...(battleChanged && { battleTickets: battle.tickets, lastBattleTicketRegen: battle.newLastRegen }),
        },
      });
    }

    return {
      huntTickets: hunt.tickets,
      battleTickets: battle.tickets,
      maxHuntTickets: cfg.maxHunt,
      maxBattleTickets: cfg.maxBattle,
      nextHuntTicketAt: getNextTicketAt(hunt.tickets, cfg.maxHunt, hunt.newLastRegen, cfg.huntRegenMin),
      nextBattleTicketAt: getNextTicketAt(battle.tickets, cfg.maxBattle, battle.newLastRegen, cfg.battleRegenMin),
      huntRegenMinutes: cfg.huntRegenMin,
      battleRegenMinutes: cfg.battleRegenMin,
    };
  }
}
