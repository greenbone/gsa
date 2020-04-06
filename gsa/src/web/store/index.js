/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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
import 'core-js/features/object/assign'; // internally needed by redux-logger

import {createStore, applyMiddleware} from 'redux';

import thunk from 'redux-thunk';

import {createLogger} from 'redux-logger';

import rootReducer from './reducers';

const configureStore = (debug = false) => {
  const middlewares = [thunk];

  if (debug) {
    middlewares.push(createLogger());
  }

  return createStore(rootReducer, applyMiddleware(...middlewares));
};

export default configureStore;
// vim: set ts=2 sw=2 tw=80:
