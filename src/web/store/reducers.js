/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {portListsApi} from 'gmp/commands/portlists';
import {combineReducers} from 'redux';
import {CLEAR_STORE} from 'web/store/actions';
import dashboardData from 'web/store/dashboard/data/reducers';
import dashboardSettings from 'web/store/dashboard/settings/reducers';
import entities from 'web/store/entities/reducers';
import feedStatus from 'web/store/feedStatus/reducers';
import pages from 'web/store/pages/reducers';
import userSettings from 'web/store/usersettings/reducers';

const rootReducer = combineReducers({
  dashboardData,
  dashboardSettings,
  entities,
  userSettings,
  pages,
  feedStatus,
  [portListsApi.reducerPath]: portListsApi.reducer,
});

const clearStoreReducer = (state = {}, action) => {
  if (action.type === CLEAR_STORE) {
    state = {};
  }
  return rootReducer(state, action);
};

export default clearStoreReducer;
