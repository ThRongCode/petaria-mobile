import { AnyAction, PayloadAction } from '@reduxjs/toolkit'
import { call, put, takeLatest } from 'redux-saga/effects'
import { appActions, userActions } from '../reducers'
import { RouteKeys } from '@/routes/RouteKeys'
import { router } from 'expo-router'
import { apiClient } from '@/services/api'
import { IUserSignInPayload, IUserSignUpPayload } from '../types'
import { setData, getData, removeData } from '@/utilities/storage'
import { TOKEN } from '@/constants'

function* userLoginSaga(action: PayloadAction<IUserSignInPayload>): IterableIterator<AnyAction> {
  try {
    yield put(appActions.setShowGlobalIndicator(true))
    
    const { email, password } = action.payload
    
    // Call login API
    const response: Awaited<ReturnType<typeof apiClient.login>> = yield call(
      [apiClient, apiClient.login],
      email,
      password
    )

    if (response.success && response.data) {
      const { token, userId, user } = response.data

      // Store token
      yield call(setData, TOKEN.token, token)

      // Set auth token in API client
      apiClient.setAuthToken(token, userId)

      // Update Redux state with user info including tickets
      yield put(userActions.userLoginSuccess({
        user: {
          id: user?.id || userId,
          email: user?.email || email,
          username: user?.username || '',
          level: user?.level || 1,
          xp: user?.xp || 0,
          coins: user?.coins || 0,
          gems: user?.gems || 0,
          huntTickets: user?.huntTickets || 5,
          battleTickets: user?.battleTickets || 20,
          lastTicketReset: user?.lastTicketReset || new Date().toISOString(),
          petCount: user?.petCount || 0,
          itemCount: user?.itemCount || 0,
        },
        token: { token, userId },
      }))

      // Load user data from API (pets, items, regions, etc.)
      yield put({ type: 'game/loadUserData' })

      // Navigate to app home
      router.replace('/(app)')
    } else {
      // Login failed
      yield put(userActions.userLoginFailure())
      console.error('Login failed:', response.error)
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Login error:', e.message)
    }
    yield put(userActions.userLoginFailure())
    router.navigate(RouteKeys.SignIn)
  } finally {
    yield put(appActions.setShowGlobalIndicator(false))
  }
}

function* userSignUpSaga(action: PayloadAction<IUserSignUpPayload>): IterableIterator<AnyAction> {
  try {
    yield put(appActions.setShowGlobalIndicator(true))
    
    const { email, password, username } = action.payload
    
    // Call register API
    const response: Awaited<ReturnType<typeof apiClient.register>> = yield call(
      [apiClient, apiClient.register],
      email,
      password,
      username
    )

    if (response.success && response.data) {
      const { token, userId, user } = response.data

      // Store token
      yield call(setData, TOKEN.token, token)

      // Set auth token in API client
      apiClient.setAuthToken(token, userId)

      // Update Redux state with user info including tickets
      yield put(userActions.userSignUpSuccess({
        user: {
          id: user?.id || userId,
          email: user?.email || email,
          username: user?.username || username,
          level: user?.level || 1,
          xp: user?.xp || 0,
          coins: user?.coins || 100,
          gems: user?.gems || 0,
          huntTickets: user?.huntTickets || 5,
          battleTickets: user?.battleTickets || 20,
          lastTicketReset: user?.lastTicketReset || new Date().toISOString(),
          petCount: user?.petCount || 0,
          itemCount: user?.itemCount || 0,
        },
        token: { token, userId },
      }))

      // Load user data from API (pets, items, regions, etc.)
      yield put({ type: 'game/loadUserData' })

      // Navigate to app home
      router.replace('/(app)')
    } else {
      // Registration failed
      yield put(userActions.userSignUpFailure())
      console.error('Registration failed:', response.error)
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Registration error:', e.message)
    }
    yield put(userActions.userSignUpFailure())
  } finally {
    yield put(appActions.setShowGlobalIndicator(false))
  }
}

function* userLogout(): IterableIterator<AnyAction> {
  try {
    // Clear stored tokens
    yield call(removeData, TOKEN.token)

    // Logout from API client
    yield call([apiClient, apiClient.logout])

    // Clear Redux state
    yield put(userActions.logout())

    // Navigate to sign in
    router.replace(RouteKeys.SignIn)
  } catch (e) {
    console.error('Logout error:', e)
  }
}

export default [
  takeLatest(userActions.userLogin.type, userLoginSaga),
  takeLatest(userActions.userSignUp.type, userSignUpSaga),
  takeLatest(userActions.logout.type, userLogout),
]
