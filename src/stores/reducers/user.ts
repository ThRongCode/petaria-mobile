import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IUser, IUserSignInPayload, IUserSignUpPayload, IUserInfo, ITokenData } from '../types'

export const userInitialState: IUser = {
  userInfo: {},
  isEndUser: false,
  tokenData: {},
  contentFlagged: '',
}

export const userSlice = createSlice({
  name: 'auth',
  initialState: userInitialState,
  reducers: {
    userLogin: (state, action: PayloadAction<IUserSignInPayload>) => {
      // Payload handled by saga
    },
    userLoginSuccess: (state, action: PayloadAction<{ user: IUserInfo; token: ITokenData }>) => {
      state.userInfo = action.payload.user
      state.tokenData = action.payload.token
      state.isEndUser = true
    },
    userLoginFailure: (state) => {
      state.userInfo = {}
      state.tokenData = {}
      state.isEndUser = false
    },
    userSignUp: (state, action: PayloadAction<IUserSignUpPayload>) => {
      // Payload handled by saga
    },
    userSignUpSuccess: (state, action: PayloadAction<{ user: IUserInfo; token: ITokenData }>) => {
      state.userInfo = action.payload.user
      state.tokenData = action.payload.token
      state.isEndUser = true
    },
    userSignUpFailure: (state) => {
      state.userInfo = {}
      state.tokenData = {}
      state.isEndUser = false
    },
    updateUserProfile: (state, action: PayloadAction<Partial<IUserInfo>>) => {
      state.userInfo = { ...state.userInfo as IUserInfo, ...action.payload }
    },
    logout: (state) => {
      state.userInfo = {}
      state.tokenData = {}
      state.isEndUser = false
    },
  },
})

export const userActions = {
  ...userSlice.actions,
}

export default userSlice.reducer
