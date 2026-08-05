/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {renderHook} from 'web/testing';
import useLatestCallback from 'web/hooks/useLatestCallback';

describe('useLatestCallback tests', () => {
  test('should call the latest callback after rerender', () => {
    const firstCallback = testing.fn((value: number) => value + 1);
    const secondCallback = testing.fn((value: number) => value + 2);

    const {result, rerender} = renderHook(
      ({callback}: {callback: (value: number) => number}) =>
        useLatestCallback(callback),
      {
        initialProps: {callback: firstCallback},
      },
    );

    expect(result.current(1)).toBe(2);
    expect(firstCallback).toHaveBeenCalledWith(1);

    rerender({callback: secondCallback});

    expect(result.current(1)).toBe(3);
    expect(secondCallback).toHaveBeenCalledWith(1);
  });

  test('should return a stable callback identity', () => {
    const firstCallback = (value: number) => value + 1;
    const secondCallback = (value: number) => value + 2;

    const {result, rerender} = renderHook(
      ({callback}: {callback: (value: number) => number}) =>
        useLatestCallback(callback),
      {
        initialProps: {callback: firstCallback},
      },
    );

    const stableCallback = result.current;

    rerender({callback: secondCallback});

    expect(result.current).toBe(stableCallback);
  });
});
