/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {SET_SYNC_STATUS, SET_ERROR} from 'web/store/feedStatus/actions';
import feedStatus from 'web/store/feedStatus/reducers';

describe('feedStatus reducer', () => {
  const initialState = {
    isSyncing: false,
    error: undefined,
  };

  test('should return the initial state', () => {
    expect(feedStatus(undefined, {})).toEqual(initialState);
  });

  test('should handle SET_SYNC_STATUS', () => {
    const action = {
      type: SET_SYNC_STATUS,
      payload: true,
    };
    const expectedState = {
      isSyncing: true,
      error: undefined,
    };

    expect(feedStatus(initialState, action)).toEqual(expectedState);
  });

  test('should handle SET_ERROR', () => {
    const action = {
      type: SET_ERROR,
      payload: 'Fetch failed',
    };
    const expectedState = {
      isSyncing: false,
      error: 'Fetch failed',
    };
    expect(feedStatus(initialState, action)).toEqual(expectedState);
  });
});
