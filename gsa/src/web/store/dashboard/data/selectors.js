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

import {filterIdentifier} from 'web/store/utils';

class DashboardData {
  constructor(rootState) {
    this.state = rootState;
  }

  _getById(id, filter) {
    if (isDefined(this.state)) {
      const state = this.state[id];
      if (!isDefined(state)) {
        return undefined;
      }
      const filterString = filterIdentifier(filter);
      return state[filterString];
    }
    return undefined;
  }

  getIsLoading(id, filter) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.isLoading : false;
  }

  getError(id, filter) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.error : undefined;
  }

  getData(id, filter) {
    const state = this._getById(id, filter);
    return isDefined(state) ? state.data : undefined;
  }
}

const getDashboardData = rootState => {
  const dashboardData = isDefined(rootState)
    ? rootState.dashboardData
    : undefined;

  return new DashboardData(dashboardData);
};

export default getDashboardData;

// vim: set ts=2 sw=2 tw=80:
