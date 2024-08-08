/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const CHANGE_PAGE_FILTER = 'CHANGE_PAGE_FILTER';

export const pageFilter = (page, filter) => ({
  type: CHANGE_PAGE_FILTER,
  page,
  filter,
});

// vim: set ts=2 sw=2 tw=80:
