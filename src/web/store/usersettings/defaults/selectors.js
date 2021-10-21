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
import {isDefined} from 'gmp/utils/identity';

class UserSettingsDefaultsSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoading() {
    return !!this.state.isLoading;
  }

  getByName(name) {
    return isDefined(this.state.byName) ? this.state.byName[name] : undefined;
  }

  getValueByName(name) {
    const {byName = {}} = this.state;
    const setting = byName[name];
    return isDefined(setting) ? setting.value : undefined;
  }

  getError() {
    return this.state.error;
  }
}

export const getUserSettingsDefaults = rootState => {
  const {userSettings = {}} = rootState;
  const {defaults} = userSettings;
  return new UserSettingsDefaultsSelector(defaults);
};

// vim: set ts=2 sw=2 tw=80:
