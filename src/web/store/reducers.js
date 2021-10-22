/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import {combineReducers} from 'redux';

import dashboardData from './dashboard/data/reducers';
import dashboardSettings from './dashboard/settings/reducers';
import userSettings from './usersettings/reducers';
import {businessProcessMaps} from './businessprocessmaps/reducers';
import pages from './pages/reducers';

import entities from './entities/reducers';
import {CLEAR_STORE} from 'web/store/actions';

const rootReducer = combineReducers({
  businessProcessMaps,
  dashboardData,
  dashboardSettings,
  entities,
  userSettings,
  pages,
});

const clearStoreReducer = (state = {}, action) => {
  if (action.type === CLEAR_STORE) {
    state = {};
  }
  return rootReducer(state, action);
};

export default clearStoreReducer;

// vim: set ts=2 sw=2 tw=80:
