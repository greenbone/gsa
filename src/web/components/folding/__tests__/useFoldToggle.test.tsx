/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {act, renderHook} from 'web/testing';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';
import useFoldToggle from 'web/components/folding/useFoldToggle';

describe('useFoldToggle', () => {
  test('should use the default fold state', () => {
    const {result} = renderHook(() => useFoldToggle());

    expect(result.current.foldState).toBe(FoldState.UNFOLDED);
  });

  test('should use the initial fold state', () => {
    const {result} = renderHook(() =>
      useFoldToggle({initialFoldState: FoldState.FOLDED}),
    );

    expect(result.current.foldState).toBe(FoldState.FOLDED);
  });

  test.each([
    [FoldState.FOLDED, FoldState.UNFOLDING_START],
    [FoldState.UNFOLDED, FoldState.FOLDING_START],
    [FoldState.UNFOLDING_START, FoldState.FOLDED],
    [FoldState.FOLDING_START, FoldState.UNFOLDED],
    [FoldState.UNFOLDING, FoldState.FOLDING],
    [FoldState.FOLDING, FoldState.UNFOLDING],
  ])('should toggle %s to %s', (initialFoldState, expectedFoldState) => {
    const {result} = renderHook(() => useFoldToggle({initialFoldState}));

    act(() => result.current.onFoldToggle());
    expect(result.current.foldState).toBe(expectedFoldState);
  });

  test.each([
    [FoldState.FOLDED, FoldState.FOLDED],
    [FoldState.UNFOLDED, FoldState.UNFOLDED],
    [FoldState.UNFOLDING_START, FoldState.UNFOLDING],
    [FoldState.FOLDING_START, FoldState.FOLDING],
    [FoldState.UNFOLDING, FoldState.UNFOLDED],
    [FoldState.FOLDING, FoldState.FOLDED],
  ])(
    'should handle fold step end from %s to %s',
    (initialFoldState, expectedFoldState) => {
      const {result} = renderHook(() => useFoldToggle({initialFoldState}));

      act(() => result.current.onFoldStepEnd());
      expect(result.current.foldState).toBe(expectedFoldState);
    },
  );

  test('should not update the initial state after rerender', () => {
    const {result, rerender} = renderHook(
      ({initialFoldState}: {initialFoldState: FoldStateType}) =>
        useFoldToggle({initialFoldState}),
      {
        initialProps: {
          initialFoldState: FoldState.FOLDED as FoldStateType,
        },
      },
    );

    rerender({initialFoldState: FoldState.UNFOLDED});

    expect(result.current.foldState).toBe(FoldState.FOLDED);
  });

  test('should keep handlers stable after state updates', () => {
    const {result, rerender} = renderHook(() => useFoldToggle());
    const {onFoldStepEnd, onFoldToggle} = result.current;

    act(() => result.current.onFoldToggle());
    rerender();

    expect(result.current.onFoldStepEnd).toBe(onFoldStepEnd);
    expect(result.current.onFoldToggle).toBe(onFoldToggle);
  });
});
