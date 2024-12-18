/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  SET_SYNC_STATUS,
  SET_ERROR,
  setSyncStatus,
  setError,
} from 'web/store/feedStatus/actions';

describe('actions', () => {
  test('setSyncStatus should create an action to set sync status', () => {
    const isSyncing = true;
    const expectedAction = {
      type: SET_SYNC_STATUS,
      payload: isSyncing,
    };
    expect(setSyncStatus(isSyncing)).toEqual(expectedAction);
  });

  test('setError should create an action to set an error', () => {
    const error = 'Fetch failed';
    const expectedAction = {
      type: SET_ERROR,
      payload: error,
    };
    expect(setError(error)).toEqual(expectedAction);
  });
});
