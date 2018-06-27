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
import {is_defined, has_value} from 'gmp/utils/identity';

class EntitiesSelector {

  constructor(state = {}) {
    this.state = state;
  }

  _getByFilter(filter) {
    const filterString = is_defined(filter) ? filter.toFilterString() :
      'default';
    return this.state[filterString];
  }

  getIsLoading(filter) {
    const state = this._getByFilter(filter);
    return is_defined(state) ? state.isLoading : false;
  }

  getError(filter) {
    const state = this._getByFilter(filter);
    return is_defined(state) ? state.error : undefined;
  }

  getEntities(filter) {
    const state = this._getByFilter(filter);
    if (is_defined(state) && has_value(state.entities)) {
      return state.entities.map(id => this.getEntity(id)).filter(is_defined);
    }
    return undefined;
  }

  getEntity(id) {
    return this.state.byId[id];
  }
};

export const createSelector = name => rootState =>
  new EntitiesSelector(rootState.entities[name]);

// vim: set ts=2 sw=2 tw=80:
