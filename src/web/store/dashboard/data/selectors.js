/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
