/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
