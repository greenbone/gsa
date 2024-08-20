/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  configureStore as reduxConfigureStore,
  isImmutableDefault,
} from '@reduxjs/toolkit';

import logger from 'redux-logger';

import Rejection from 'gmp/http/rejection';

import {isDate} from 'gmp/models/date';
import {isEvent} from 'gmp/models/event';

import rootReducer from './reducers';

const isError = obj => obj instanceof Error || obj instanceof Rejection;

const isImmutable = value =>
  isDate(value) ||
  isEvent(value) ||
  isError(value) ||
  isImmutableDefault(value);

const configureStore = ({debug = false, testing = false}) => {
  return reduxConfigureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      // in production getDefaultMiddleware only creates the redux thunk middleware
      let middlewares = getDefaultMiddleware({
        serializableCheck: false,
        // enable immutable check only in development. not in testing and production
        immutableCheck: testing ? false : {isImmutable, warnAfter: 200},
      });
      if (debug) {
        middlewares = middlewares.concat(logger);
      }
      return middlewares;
    },
  });
};

export default configureStore;
