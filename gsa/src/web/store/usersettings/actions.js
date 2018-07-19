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

import {getIsLoading} from './selectors';

export const SET_LANGUAGE = 'SET_LANGUAGE';
export const USER_SETTINGS_LOADING_REQUEST = 'USER_SETTINGS_LOADING_REQUEST';
export const USER_SETTINGS_LOADING_SUCCESS = 'USER_SETTINGS_LOADING_SUCCESS';
export const USER_SETTINGS_LOADING_ERROR = 'USER_SETTINGS_LOADING_ERROR';

export const setLanguage = language => ({
  type: SET_LANGUAGE,
  data: language,
});

const requestUserData = () => ({
  type: USER_SETTINGS_LOADING_REQUEST,
});

const receivedUserData = data => ({
  type: USER_SETTINGS_LOADING_SUCCESS,
  data,
});

const receivedUserDataError = error => ({
  type: USER_SETTINGS_LOADING_ERROR,
  error,
});

export const loadFunc = ({gmp}) => (dispatch, getState) => {
  if (getIsLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestUserData());

  return gmp.user.currentSettings().then(
    response => dispatch(receivedUserData(response.data._settings)),
    error => dispatch(receivedUserDataError(error)),
  );
};

// vim: set ts=2 sw=2 two=80:
