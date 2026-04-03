import { PrismaService } from '../prisma/prisma.service';
import { ConfigLoaderService } from '../config/config-loader.service';

/**
 * Utility class for handling time-based ticket regeneration.
 * Hunt tickets regen every N minutes, battle tickets regen every M minutes.
 */
export class TicketResetUtil {
  /**
   * Check if any tickets have regenerated since the last regen timestamp
   * and grant them (capped at max). Updates the regen timestamp.
   */
  static async checkAndResetTickets(
    prisma: PrismaService,
    userId: string,
  ): Promise<{
    huntTickets: number;
    battleTickets: number;
    maxHuntTickets: number;
    maxBattleTickets: number;
    nextHuntTicketAt: string | null;
    nextBattleTicketAt: string | null;
    huntRegenMinutes: number;
    battleRegenMinutes: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastHuntTicketRegen: true,
        lastBattleTicketRegen: true,
        huntTickets: true,
        battleTickets: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const loader = ConfigLoaderService.getInstance();
    const gc = loader?.getGameConstants();
    const maxHunt = gc?.tickets?.maxHuntTickets ?? 5;
    const maxBattle = gc?.tickets?.maxBattleTickets ?? 20;
    const huntRegenMin = gc?.tickets?.huntRegenMinutes ?? 180;
    const battleRegenMin = gc?.tickets?.battleRegenMinutes ?? 60;

    const now = Date.now();
    let { huntTickets, battleTickets } = user;
    let lastHuntRegen = new Date(user.lastHuntTicketRegen).getTime();
    let lastBattleRegen = new Date(user.lastBattleTicketRegen).getTime();

    // Regenerate hunt tickets
    if (huntTickets < maxHunt) {
      const elapsed = now - lastHuntRegen;
      const ticketsEarned = Math.floor(elapsed / (huntRegenMin * 60_000));
      if (ticketsEarned > 0) {
        huntTickets = Math.min(huntTickets + ticketsEarned, maxHunt);
        lastHuntRegen = lastHuntRegen + ticketsEarned * huntRegenMin * 60_000;
      }
    }

    // Regenerate battle tickets
    if (battleTickets < maxBattle) {
      const elapsed = now - lastBattleRegen;
      const ticketsEarned = Math.floor(elapsed / (battleRegenMin * 60_000));
      if (ticketsEarned > 0) {
        battleTickets = Math.min(battleTickets + ticketsEarned, maxBattle);
        lastBattleRegen = lastBattleRegen + ticketsEarned * battleRegenMin * 60_000;
      }
    }

    // Persist changes
    await prisma.user.update({
      where: { id: userId },
      data: {
        huntTickets,
        battleTickets,
        lastHuntTicketRegen: new Date(lastHuntRegen),
        lastBattleTicketRegen: new Date(lastBattleRegen),
      },
    });

    // Calculate next ticket timestamps
    const nextHuntTicketAt =
      huntTickets < maxHunt
        ? new Date(lastHuntRegen + huntRegenMin * 60_000).toISOString()
        : null;
    const nextBattleTicketAt =
      battleTickets < maxBattle
        ? new Date(lastBattleRegen + battleRegenMin * 60_000).toISOString()
        : null;

    return {
      huntTickets,
      battleTickets,
      maxHuntTickets: maxHunt,
      maxBattleTickets: maxBattle,
      nextHuntTicketAt,
      nextBattleTicketAt,
      huntRegenMinutes: huntRegenMin,
      battleRegenMinutes: battleRegenMin,
    };
  }
}
