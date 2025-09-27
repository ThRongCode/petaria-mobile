import { combineReducers } from '@reduxjs/toolkit'

// Reducer Imports
import app, { appInitialState } from './app'
import loading from './loading'
import user, { userInitialState } from './user'
import game, { gameInitialState } from './game'
import { persistReducer } from 'redux-persist'
import INITIAL_STATE from '../initialState'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Reducer Export
export * from './app'
export * from './user'
export * from './game'

export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: Object.keys(INITIAL_STATE),
}

const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
}

const gamePersistConfig = {
  key: 'game',
  storage: AsyncStorage,
}

export const InitialState = {
  user: userInitialState,
  app: appInitialState,
  game: gameInitialState,
}

export default combineReducers({
  // Reducers
  user: persistReducer(userPersistConfig, user),
  game: persistReducer(gamePersistConfig, game),
  app,
  loading,
})
