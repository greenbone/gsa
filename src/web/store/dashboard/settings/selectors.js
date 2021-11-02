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

export class DashboardSetting {
  constructor(rootState) {
    this.state = rootState;
  }

  getById(id) {
    if (isDefined(this.state) && isDefined(this.state.byId)) {
      return this.state.byId[id];
    }
    return undefined;
  }

  getDefaultsById(id) {
    if (isDefined(this.state) && isDefined(this.state.defaults)) {
      const defaults = this.state.defaults[id];
      return isDefined(defaults) ? defaults : {};
    }
    return {};
  }

  hasSettings(id) {
    return isDefined(this.getById(id));
  }

  getError(id) {
    return isDefined(this.state) && isDefined(this.state.errors)
      ? this.state.errors[id]
      : undefined;
  }

  getIsLoading(id) {
    return isDefined(this.state) && isDefined(this.state.isLoading)
      ? !!this.state.isLoading[id]
      : false;
  }
}

const getDashboardSettings = rootState => {
  const dashboardSettings = isDefined(rootState)
    ? rootState.dashboardSettings
    : undefined;

  return new DashboardSetting(dashboardSettings);
};

export default getDashboardSettings;

// vim: set ts=2 sw=2 tw=80:
