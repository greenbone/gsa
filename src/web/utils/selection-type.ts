/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type SelectionTypeType =
  (typeof SelectionType)[keyof typeof SelectionType];
const SelectionType = {
  SELECTION_PAGE_CONTENTS: '0',
  SELECTION_USER: '1',
  SELECTION_FILTER: '2',
} as const;

export default SelectionType;
