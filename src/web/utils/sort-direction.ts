/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type SortDirectionType = typeof ASC | typeof DESC;
export const ASC = 'asc';
export const DESC = 'desc';

const SortDirection = {
  ASC,
  DESC,
} as const;

export default SortDirection;
