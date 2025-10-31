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
    energy: number;
    maxEnergy: number;
  };
}
