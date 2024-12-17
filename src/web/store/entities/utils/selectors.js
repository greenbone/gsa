/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter, {ALL_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {filterIdentifier} from 'web/store/utils';

export class EntitySelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoadingEntity(id) {
    return isDefined(this.state.isLoading) ? !!this.state.isLoading[id] : false;
  }

  getEntityError(id) {
    return isDefined(this.state.errors) ? this.state.errors[id] : undefined;
  }

  getEntity(id) {
    return isDefined(this.state.byId) ? this.state.byId[id] : undefined;
  }
}

export class EntitiesSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoadingAllEntities(filter) {
    if (!isDefined(filter)) {
      return isDefined(this.state.isLoading)
        ? !!this.state.isLoading[filterIdentifier(ALL_FILTER)]
        : false;
    }
    filter = isDefined(filter.toFilterString)
      ? filter.all()
      : Filter.fromString(filter).all();
    return isDefined(this.state.isLoading)
      ? !!this.state.isLoading[filterIdentifier(filter)]
      : false;
  }

  isLoadingEntities(filter) {
    return isDefined(this.state.isLoading)
      ? !!this.state.isLoading[filterIdentifier(filter)]
      : false;
  }

  isLoadingAnyEntities() {
    const loaders = this.state.isLoading;
    const bools = Object.values(loaders);
    return isDefined(bools.length > 0)
      ? !bools.every(bool => bool === false)
      : false;
  }

  getEntitiesError(filter) {
    return isDefined(this.state.errors)
      ? this.state.errors[filterIdentifier(filter)]
      : undefined;
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
}

class Selector {
  constructor(state = {}) {
    this.entitySelector = new EntitySelector(state);
    this.entitiesSelector = new EntitiesSelector(state);
  }

  isLoadingEntity(id) {
    return this.entitySelector.isLoadingEntity(id);
  }

  getEntityError(id) {
    return this.entitySelector.getEntityError(id);
  }

  getEntity(id) {
    return this.entitySelector.getEntity(id);
  }

  isLoadingEntities(filter) {
    return this.entitiesSelector.isLoadingEntities(filter);
  }

  isLoadingAnyEntities() {
    return this.entitiesSelector.isLoadingAnyEntities();
  }

  isLoadingAllEntities(filter) {
    return this.entitiesSelector.isLoadingAllEntities(filter);
  }

  getEntitiesError(filter) {
    return this.entitiesSelector.getEntitiesError(filter);
  }

  getEntities(filter) {
    return this.entitiesSelector.getEntities(filter);
  }

  getAllEntities(filter) {
    return this.entitiesSelector.getAllEntities(filter);
  }

  getEntitiesCounts(filter) {
    return this.entitiesSelector.getEntitiesCounts(filter);
  }

  getLoadedFilter(filter) {
    return this.entitiesSelector.getLoadedFilter(filter);
  }
}

export const createEntitySelector = name => rootState =>
  new EntitySelector(rootState.entities[name]);

export const createEntitiesSelector = name => rootState =>
  new EntitiesSelector(rootState.entities[name]);

export const createSelector = name => rootState =>
  new Selector(rootState.entities[name]);
