import { PrismaService } from '../prisma/prisma.service';

/**
 * Utility class for handling daily ticket resets
 */
export class TicketResetUtil {
  /**
   * Check if tickets need to be reset and perform the reset if needed
   * Resets occur if the last reset was before today (UTC)
   * 
   * @param prisma - PrismaService instance
   * @param userId - User ID to check/reset tickets for
   * @returns Object containing reset status and message
   */
  static async checkAndResetTickets(
    prisma: PrismaService,
    userId: string,
  ): Promise<{ reset: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastTicketReset: true,
        huntTickets: true,
        battleTickets: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get start of today (UTC)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get start of last reset day (UTC)
    const lastReset = new Date(user.lastTicketReset);
    const lastResetStart = new Date(
      lastReset.getFullYear(),
      lastReset.getMonth(),
      lastReset.getDate(),
    );

    // Check if last reset was before today
    if (lastResetStart < todayStart) {
      // Reset tickets
      await prisma.user.update({
        where: { id: userId },
        data: {
          huntTickets: 5,
          battleTickets: 20,
          lastTicketReset: now,
        },
      });

      return {
        reset: true,
        message: 'Tickets have been reset! You now have 5 hunt tickets and 20 battle tickets.',
      };
    }

    return {
      reset: false,
      message: 'Tickets are still valid for today.',
    };
  }
}
