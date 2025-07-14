/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const ASC = 'asc';
export const DESC = 'desc';

const SortDirection = {
  ASC,
  DESC,
} as const;

export type SortDirectionType = typeof ASC | typeof DESC;

export default SortDirection;
