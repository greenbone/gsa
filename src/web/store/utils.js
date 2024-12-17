/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue} from 'gmp/utils/identity';

/**
 * Return a unique identifier string for a filter
 *
 * @param {Filter} filter A Filter model (may be undefined or null)
 *
 * @returns {String} A filter identifier to be used in the store
 */

export const filterIdentifier = filter =>
  hasValue(filter) ? `filter:${filter.toFilterString()}` : 'default';

/**
 * A combineReducers version to allow to return undefined for a state.
 *
 * @param {Object} reducers An object containing reducer functions.
 *
 * @returns {Function} A new combined reducer function
 */
export const combineReducers =
  reducers =>
  (state = {}, action) => {
    let hasChanged = false;
    const nextState = {};

    for (const [name, reducer] of Object.entries(reducers)) {
      const prevStateForReducer = state[name];
      const nextStateForReducers = reducer(prevStateForReducer, action);

      nextState[name] = nextStateForReducers;
      hasChanged = hasChanged || prevStateForReducer !== nextStateForReducers;
    }

    return hasChanged ? nextState : state;
  };
