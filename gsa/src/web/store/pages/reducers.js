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
import {isDefined} from 'gmp/utils/identity';

import {CHANGE_PAGE_FILTER} from './actions';
import {combineReducers} from 'web/store/utils';

const filter = (state, action) => {
  switch (action.type) {
    case CHANGE_PAGE_FILTER:
      return action.filter;
    default:
      return state;
  }
};

const page = combineReducers({
  filter,
});

const pageByName = (state = {}, action) => {
  const {page: pageName} = action;

  if (!isDefined(pageName)) {
    return state;
  }

  return {
    ...state,
    [pageName]: page(state[pageName], action),
  };
};

export default pageByName;

// vim: set ts=2 sw=2 tw=80:
