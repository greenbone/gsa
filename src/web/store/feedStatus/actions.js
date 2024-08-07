/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const SET_SYNC_STATUS = 'SET_SYNC_STATUS';
export const SET_ERROR = 'SET_ERROR';

export const setSyncStatus = isSyncing => ({
  type: SET_SYNC_STATUS,
  payload: isSyncing,
});

export const setError = error => ({
  type: SET_ERROR,
  payload: error,
});
