/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils/identity';

class DashboardData {

  constructor(rootState) {
    this.state = rootState;
  }

  _getById(id) {
    if (is_defined(this.state)) {
      return this.state[id];
    }
    return undefined;
  }

  getIsLoading(id) {
    const state = this._getById(id);
    return is_defined(state) ? state.isLoading : false;
  }

  getError(id) {
    const state = this._getById(id);
    return is_defined(state) ? state.error : undefined;
  }

  getData(id) {
    const state = this._getById(id);
    return is_defined(state) ? state.data : undefined;
  }
}

const getDashboardData = rootState => {
  const dashboardData = is_defined(rootState) ?
    rootState.dashboardData : undefined;

  return new DashboardData(dashboardData);
};

export default getDashboardData;

// vim: set ts=2 sw=2 tw=80:
