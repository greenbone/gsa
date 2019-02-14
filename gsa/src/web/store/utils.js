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
import 'core-js/fn/object/entries';

import {isDefined} from 'gmp/utils/identity';

/**
 * Return a unique identifier string for a filter
 *
 * @param {Filter} filter A Filter model (may be undefined)
 *
 * @returns {String} A filter identifier to be used in the store
 */
export const filterIdentifier = filter =>
  isDefined(filter) ? `filter:${filter.toFilterString()}` : 'default';

/**
 * A combineReducers version to allow to return undefined for a state.
 *
 * @param {Object} reducers An object containing reducer functions.
 *
 * @returns {Function} A new combined reducer function
 */
export const combineReducers = reducers => (state = {}, action) => {
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

// vim: set ts=2 sw=2 tw=80:
