/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


class UserSettingsDefaultFilterSelector {
  constructor(state = {}, entityType) {
    this.state = state;
    this.entityType = entityType;
  }

  _get(entityType = this.entityType) {
    return this.state[entityType] || {};
  }

  isLoading(entityType) {
    const state = this._get(entityType);
    return !!state.isLoading;
  }

  getFilter(entityType) {
    const state = this._get(entityType);
    return state.filter;
  }

  getError(entityType) {
    const state = this._get(entityType);
    return state.error;
  }
}

export const getUserSettingsDefaultFilter = (rootState, entityType) => {
  const {userSettings = {}} = rootState;
  const {defaultFilters} = userSettings;
  return new UserSettingsDefaultFilterSelector(defaultFilters, entityType);
};
