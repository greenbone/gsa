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
import Filter, {ALL_FILTER} from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import {filterIdentifier} from 'web/store/utils';

class EntitiesSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoadingEntities(filter) {
    return isDefined(this.state.isLoading)
      ? !!this.state.isLoading[filterIdentifier(filter)]
      : false;
  }

  isLoadingEntity(id) {
    return isDefined(this.state.isLoading) ? !!this.state.isLoading[id] : false;
  }

  getEntitiesError(filter) {
    return isDefined(this.state.errors)
      ? this.state.errors[filterIdentifier(filter)]
      : undefined;
  }

  getEntityError(id) {
    return isDefined(this.state.errors) ? this.state.errors[id] : undefined;
  }

  getEntities(filter) {
    const state = this.state[filterIdentifier(filter)];
    if (isDefined(state) && state.ids && isDefined(this.state.byId)) {
      return state.ids.map(id => this.state.byId[id]).filter(isDefined);
    }
    return undefined;
  }

  getAllEntities(filter) {
    if (!isDefined(filter)) {
      return this.getEntities(ALL_FILTER);
    }
    return isDefined(filter.toFilterString)
      ? this.getEntities(filter.all())
      : this.getEntities(Filter.fromString(filter).all());
  }

  getEntitiesCounts(filter) {
    const state = this.state[filterIdentifier(filter)];
    return isDefined(state) ? state.counts : undefined;
  }

  getLoadedFilter(filter) {
    const state = this.state[filterIdentifier(filter)];
    return isDefined(state) ? state.loadedFilter : undefined;
  }

  getEntity(id) {
    return isDefined(this.state.byId) ? this.state.byId[id] : undefined;
  }
}

export const createSelector = name => rootState =>
  new EntitiesSelector(rootState.entities[name]);

// vim: set ts=2 sw=2 tw=80:
