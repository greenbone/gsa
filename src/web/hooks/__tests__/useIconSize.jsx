/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useIconSize, {
  ICON_SIZE_LARGE_PIXELS,
  ICON_SIZE_MEDIUM_PIXELS,
  ICON_SIZE_SMALL_PIXELS,
} from 'web/hooks/useIconSize';
import {describe, test, expect} from '@gsa/testing';
import {renderHook} from 'web/utils/testing';

describe('useIconSize', () => {
  test('should return small size by default', () => {
    const {result} = renderHook(() => useIconSize());
    expect(result.current).toEqual({
      height: ICON_SIZE_SMALL_PIXELS,
      width: ICON_SIZE_SMALL_PIXELS,
    });
  });

  test('should return medium size when specified', () => {
    const {result} = renderHook(() => useIconSize('medium'));
    expect(result.current).toEqual({
      height: ICON_SIZE_MEDIUM_PIXELS,
      width: ICON_SIZE_MEDIUM_PIXELS,
    });
  });

  test('should return large size when specified', () => {
    const {result} = renderHook(() => useIconSize('large'));
    expect(result.current).toEqual({
      height: ICON_SIZE_LARGE_PIXELS,
      width: ICON_SIZE_LARGE_PIXELS,
    });
  });

  test('should return custom size when specified', () => {
    const {result} = renderHook(() => useIconSize(['100px', '200px']));
    expect(result.current).toEqual({
      height: '200px',
      width: '100px',
    });
  });
});
