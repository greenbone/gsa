/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {getTimezone, getIsLoading} from './selectors';

export const TIMEZONE_LOADING_REQUEST = 'TIMEZONE_LOADING_REQUEST';
export const TIMEZONE_LOADING_SUCCESS = 'TIMEZONE_LOADING_SUCCESS';

const requestTimezone = () => ({
  type: TIMEZONE_LOADING_REQUEST,
});

const receivedTimezone = value => ({
  type: TIMEZONE_LOADING_SUCCESS,
  value,
});

export const loadTimezone = ({gmp}) => (dispatch, getState) => {
  const rootState = getState();
  const state = getTimezone(rootState);

  if (getIsLoading(state)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestTimezone());

  const {timezone} = gmp.globals;
  dispatch(receivedTimezone(timezone));
};

// vim: set ts=2 sw=2 two=80:
