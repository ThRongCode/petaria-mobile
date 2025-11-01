export interface IUserInfo {
  id: string
  email: string
  username: string
  level: number
  xp: number
  coins: number
  gems: number
  huntTickets: number
  battleTickets: number
  lastTicketReset: string
  petCount: number
  itemCount: number
}

export interface ITokenData {
  token: string
  userId: string
}

export interface IUser {
  userInfo: IUserInfo | Record<string, never>
  isEndUser?: boolean
  tokenData?: ITokenData | Record<string, never>
  contentFlagged?: string
}

export interface IUserSignInPayload {
  email: string
  password: string
}

export interface IUserSignUpPayload {
  email: string
  password: string
  username: string
}
