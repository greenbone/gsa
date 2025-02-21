/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import IconSizeContext from 'web/components/provider/IconSizeProvider';

export const ICON_SIZE_LARGE_PIXELS = '50px';
export const ICON_SIZE_MEDIUM_PIXELS = '24px';
export const ICON_SIZE_SMALL_PIXELS = '20px';
export const ICON_SIZE_TINY_PIXELS = '11px';

const useIconSize = (initialSize = 'small') => {
  const iconSize = useContext(IconSizeContext);
  const size = iconSize ?? initialSize;

  let width;
  let height;

  switch (size) {
    case 'small':
      height = width = ICON_SIZE_SMALL_PIXELS;
      break;
    case 'medium':
      height = width = ICON_SIZE_MEDIUM_PIXELS;
      break;
    case 'large':
      height = width = ICON_SIZE_LARGE_PIXELS;
      break;
    case 'tiny':
      height = width = ICON_SIZE_TINY_PIXELS;
      break;
    default:
      if (Array.isArray(size)) {
        width = size[0];
        height = size[1];
      }
      break;
  }

  return {height, width};
};

export default useIconSize;
