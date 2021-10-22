/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
