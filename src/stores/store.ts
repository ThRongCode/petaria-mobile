import { applyMiddleware, configureStore } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector as useReduxSelector } from 'react-redux'
import { persistReducer, persistStore } from 'redux-persist'
//import createSagaMiddleware from 'redux-saga'
import reducers, { persistConfig } from './reducers'
import rootSaga from './saga'

const createSagaMiddleware = require('redux-saga').default;

const sagaMiddleware = createSagaMiddleware();

const middlewareEnhancer = applyMiddleware(sagaMiddleware)

// DISABLED: Redux Persist for API-first architecture
// 
// The app is currently using an API-first approach where data is always
// fetched fresh from the mock API. Redux Persist is disabled to avoid
// caching stale data that's hard to update.
//
// TO RE-ENABLE PERSISTENCE (for offline-first mode):
// 1. Set USE_PERSIST = true
// 2. Restart the app to initialize persistor
// 3. Consider implementing a cache invalidation strategy
//
const USE_PERSIST = false // Set to true to enable persistence

const persistedReducer = USE_PERSIST ? persistReducer(persistConfig, reducers) : reducers

const store = configureStore({
  reducer: persistedReducer as any, // Type workaround for conditional persist
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false, thunk: false }).concat(),
  enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(middlewareEnhancer),
})

sagaMiddleware.run(rootSaga)

// Only create persistor if persistence is enabled
const persistor = USE_PERSIST ? persistStore(store) : null

export type AppDispatch = typeof store.dispatch
export type AppState = typeof store.getState
export type RootState = ReturnType<AppState>
export const useAppDispatch: () => AppDispatch = useDispatch

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
export { store, persistor }
