import { combineReducers } from '@reduxjs/toolkit'

// Reducer Imports
import app, { appInitialState } from './app'
import loading from './loading'
import user, { userInitialState } from './user'
import game, { gameInitialState } from './game'
import INITIAL_STATE from '../initialState'

// Reducer Export
export * from './app'
export * from './user'
export * from './game'

// Remove Redux Persist - API-first architecture
// Fetch fresh data from API on each app load
export const persistConfig = {
  key: 'root',
  storage: null as any, // Disabled
  whitelist: [], // Don't persist anything
}

const userPersistConfig = {
  key: 'user',
  storage: null as any, // Disabled
  whitelist: [], // Don't persist anything
}

const gamePersistConfig = {
  key: 'game',
  storage: null as any, // Disabled
  whitelist: [], // Don't persist anything
}

export const InitialState = {
  user: userInitialState,
  app: appInitialState,
  game: gameInitialState,
}

// API-first: No persistence, always fetch fresh data
export default combineReducers({
  user,
  game,
  app,
  loading,
})
