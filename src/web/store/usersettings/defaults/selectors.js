/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
