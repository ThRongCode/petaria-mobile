import { all } from 'redux-saga/effects'
// Saga Imports
import appSaga from './app'
import userSaga from './user'
import gameSaga from './game'

export default function* rootSaga() {
  yield all([
    // Sagas
    ...appSaga,
    ...userSaga,
    gameSaga(),
  ])
}
