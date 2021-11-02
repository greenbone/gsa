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
