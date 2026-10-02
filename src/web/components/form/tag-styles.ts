/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Theme from 'web/utils/theme';

type TagStyle = {
  bg: string;
  color: string;
};

export type TagStyleName = 'green' | 'red' | 'blue' | 'gray';

const tagStyles: Record<TagStyleName, TagStyle> = {
  green: {
    bg: Theme.lightGreen,
    color: Theme.darkGreen,
  },
  red: {
    bg: Theme.lightRed,
    color: Theme.darkRed,
  },
  blue: {
    bg: Theme.lightBlue,
    color: Theme.blue,
  },
  gray: {
    bg: Theme.dialogGray,
    color: Theme.darkGray,
  },
};

export default tagStyles;
