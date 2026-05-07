/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS} from 'web/store/usersettings/actions';
import defaultFilters from 'web/store/usersettings/defaultfilters/reducers';
import defaults from 'web/store/usersettings/defaults/reducers';
import {combineReducers} from 'web/store/utils';

export const reportComposerDefaults = (state = {}, action) => {
  switch (action.type) {
    case USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};

const userSettings = combineReducers({
  defaults,
  defaultFilters,
  reportComposerDefaults,
});

export default userSettings;
