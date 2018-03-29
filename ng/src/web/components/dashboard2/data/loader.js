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
import {
  receivedDashboardData,
  receivedDashboardError,
  requestDashboardData,
} from './actions';

import {getDashboardDataById, getIsLoading} from './selectors';

const loader = (id, func) => props => (dispatch, getState) => {
  const rootState = getState();
  const state = getDashboardDataById(rootState, id);

  if (getIsLoading(state)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestDashboardData(id));

  const promise = func(props);
  return promise.then(
    data => dispatch(receivedDashboardData(id, data)),
    error => dispatch(receivedDashboardError(id, error)),
  );
};

export default loader;

// vim: set ts=2 sw=2 tw=80:
