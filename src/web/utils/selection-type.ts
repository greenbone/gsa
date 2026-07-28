/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const SelectionType = {
  SELECTION_PAGE_CONTENTS: '0',
  SELECTION_USER: '1',
  SELECTION_FILTER: '2',
} as const;

export type SelectionTypeType =
  (typeof SelectionType)[keyof typeof SelectionType];

export default SelectionType;
