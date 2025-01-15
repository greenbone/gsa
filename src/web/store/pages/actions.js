/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const CHANGE_PAGE_FILTER = 'CHANGE_PAGE_FILTER';

/**
 * Action creator to set a filter for a page
 *
 * @param {String} page
 * @param {Filter} filter
 * @returns A dispatchable action
 */
export const pageFilter = (page, filter) => ({
  type: CHANGE_PAGE_FILTER,
  page,
  filter,
});
