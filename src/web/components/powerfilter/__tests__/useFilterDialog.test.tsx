/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {act, renderHook} from 'web/testing';
import Filter from 'gmp/models/filter';
import useFilterDialog, {
  type FilterDialogState,
} from 'web/components/powerfilter/useFilterDialog';

describe('useFilterDialog', () => {
  test('should initialize with default values', () => {
    const {result} = renderHook(() => useFilterDialog());

    expect(result.current.filter).toBeDefined();
    expect(result.current.filterString).toEqual('');
    expect(result.current.originalFilter).toBeUndefined();
  });

  test('should initialize with provided filter and filter string', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() =>
      useFilterDialog(initialFilter, 'foo=bar'),
    );

    expect(result.current.filter.toFilterString()).toEqual('name=test');
    expect(result.current.filterString).toEqual('foo=bar');
    expect(result.current.originalFilter).toBe(initialFilter);
  });

  test("should use criteria string from filter if initial filter string isn't provided", () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    expect(result.current.filterString).toEqual('name=test');
  });

  test('should handle filter changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleFilterChange(
        initialFilter.copy().set('status', 'active'),
      );
    });

    expect(result.current.filter.toFilterString()).toEqual(
      'name=test status=active',
    );
  });

  test('should handle filter value changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleFilterValueChange('active', 'status');
    });

    expect(result.current.filter.toFilterString()).toEqual(
      'name=test status=active',
    );
  });

  test('should handle search term changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleSearchTermChange('keyword', 'description');
    });

    expect(result.current.filter.toFilterString()).toEqual(
      'name=test description~"keyword"',
    );
  });

  test('should handle filter string changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleFilterStringChange('status=active');
    });

    expect(result.current.filterString).toBe('status=active');
    expect(result.current.filter.toFilterString()).toEqual('name=test');
  });

  test('should handle sort by changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleSortByChange('name');
    });

    expect(result.current.filter.toFilterString()).toEqual(
      'name=test sort=name',
    );
  });

  test('should handle sort order changes', () => {
    const initialFilter = new Filter().set('name', 'test').setSortBy('name');
    const {result} = renderHook(() => useFilterDialog(initialFilter));

    act(() => {
      result.current.handleSortOrderChange('sort-reverse');
    });

    expect(result.current.filter.toFilterString()).toEqual(
      'name=test sort-reverse=name',
    );
  });

  test('should handle dialog state changes', () => {
    const initialFilter = new Filter().set('name', 'test');
    const {result} = renderHook(() =>
      useFilterDialog<FilterDialogState>(initialFilter),
    );

    act(() => {
      result.current.handleChange(true, 'saveNamedFilter');
    });

    expect(result.current.saveNamedFilter).toBe(true);
  });
});
