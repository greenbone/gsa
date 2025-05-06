/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CHANGE_PAGE_FILTER} from 'web/store/pages/actions';
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
