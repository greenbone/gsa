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

import {filterIdentifier} from './reducers';

class EntitiesSelector {

  constructor(state = {}) {
    this.state = state;
  }

  isLoadingEntities(filter) {
    return is_defined(this.state.isLoading) ?
      !!this.state.isLoading[filterIdentifier(filter)] :
      false;
  }

  isLoadingEntity(id) {
    return is_defined(this.state.isLoading) ?
      !!this.state.isLoading[id] :
      false;
  }

  getError(filter) {
    return is_defined(this.state.errors) ?
      this.state.errors[filterIdentifier(filter)] :
      undefined;
  }

  getEntities(filter) {
    const ids = this.state[filterIdentifier(filter)];
    if (is_defined(ids) && is_defined(this.state.byId)) {
      return ids.map(id => this.state.byId[id]).filter(is_defined);
    }
    return [];
  }

  getEntity(id) {
    return is_defined(this.state.byId) ? this.state.byId[id] : undefined;
  }
};

export const createSelector = name => rootState =>
  new EntitiesSelector(rootState.entities[name]);

// vim: set ts=2 sw=2 tw=80:
