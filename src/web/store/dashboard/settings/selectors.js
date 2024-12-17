/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
