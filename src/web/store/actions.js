/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const CLEAR_STORE = 'CLEAR_STORE';

const clearStoreAction = {
  type: CLEAR_STORE,
};

export const clearStore = dispatch => {
  dispatch(clearStoreAction);
};

// vim: set ts=2 sw=2 tw=80:
