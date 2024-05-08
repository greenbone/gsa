/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {
  configureStore as reduxConfigureStore,
  isImmutableDefault,
} from '@reduxjs/toolkit';

import logger from 'redux-logger';

import {isDate} from 'gmp/models/date';
import {isEvent} from 'gmp/models/event';

import rootReducer from './reducers';

const isImmutable = value =>
  isDate(value) || isEvent(value) || isImmutableDefault(value);

const configureStore = ({debug = false, testing = false}) => {
  return reduxConfigureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      // in production getDefaultMiddleware only creates the redux thunk middleware
      const middlewares = getDefaultMiddleware({
        serializableCheck: false,
        // enable immutable check only in development. not in testing and production
        immutableCheck: testing ? false : {isImmutable, warnAfter: 200},
      });
      if (debug) {
        middlewares.concat(logger);
      }
      return middlewares;
    },
  });
};

export default configureStore;
