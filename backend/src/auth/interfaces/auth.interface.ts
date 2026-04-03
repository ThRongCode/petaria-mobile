export interface JwtPayload {
  sub: string; // userId
  email: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    level: number;
    xp: number;
    coins: number;
    gems: number;
    huntTickets: number;
    battleTickets: number;
    lastHuntTicketRegen: Date;
    lastBattleTicketRegen: Date;
    petCount: number;
    itemCount: number;
  };
  dailyLogin?: {
    claimed: boolean;
    alreadyClaimed: boolean;
    currentStreak: number;
    reward: { day: number; coins: number; gems: number; huntTickets: number; battleTickets: number; label: string } | null;
    nextReward: { day: number; coins: number; gems: number; huntTickets: number; battleTickets: number; label: string } | null;
    totalLogins: number;
  };
}
