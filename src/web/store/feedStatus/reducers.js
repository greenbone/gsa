/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SET_SYNC_STATUS, SET_ERROR} from 'web/store/feedStatus/actions';

const initialState = {
  isSyncing: false,
  error: null,
};

const feedStatus = (state = initialState, action) => {
  switch (action.type) {
    case SET_SYNC_STATUS:
      return {...state, isSyncing: action.payload, error: null};
    case SET_ERROR:
      return {...state, error: action.payload};
    default:
      return state;
  }
};

export default feedStatus;
