/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
