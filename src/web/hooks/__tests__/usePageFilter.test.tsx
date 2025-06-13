/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import {vi} from 'vitest';
import Filter, {DEFAULT_FALLBACK_FILTER} from 'gmp/models/filter';
import usePageFilter from 'web/hooks/usePageFilter';
import {pageFilter} from 'web/store/pages/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

let mockSearchParams = {};
const mockUseNavigate = testing.fn();
const mockUseSearchParams = testing
  .fn()
  .mockReturnValue([
    {get: key => mockSearchParams[key]},
    {set: (key, value) => (mockSearchParams[key] = value)},
  ]);

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => ({pathname: '/'}),
    useNavigate: () => mockUseNavigate(),
    useSearchParams: () => mockUseSearchParams(),
  };
});

beforeEach(() => {
  mockSearchParams = {};
});

describe('usePageFilter tests', () => {
  test('should prefer search params filter over defaultSettingFilter', async () => {
    const defaultSettingFilter = Filter.fromString('foo=bar');
    mockSearchParams['filter'] = 'location=query';

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {renderHook, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );

    const {result} = renderHook(() => usePageFilter('somePage', 'gmpName'));

    expect(result.current[0]).toEqual(
      Filter.fromString('location=query rows=42'),
    );
  });

  test('should prefer pageFilter over defaultSettingFilter', async () => {
    const pFilter = Filter.fromString('page=filter');
    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {renderHook, store} = rendererWith({
      store: true,
      gmp,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage2', pFilter));

    const {result} = renderHook(() => usePageFilter('somePage2', 'somePage'));

    expect(result.current[0]).toEqual(pFilter.set('rows', '42'));
  });

  test('should use defaultSettingFilter', async () => {
    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage2', defaultSettingFilter),
    );

    const {result} = renderHook(() => usePageFilter('somePage2', 'somePage'));

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(
        Filter.fromString('foo=bar rows=42').toString(),
      );
    });
  });

  test('should use fallbackFilter if no defaultSettingsFilter is available', async () => {
    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockResolvedValue({});
    const subscribe = testing.fn();
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    const {result} = renderHook(() =>
      usePageFilter('somePage2', 'somePage', {fallbackFilter}),
    );

    const expectedFilter = Filter.fromString('fall=back rows=42');

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(expectedFilter.toString());
    });
  });

  test('should use fallbackFilter if defaultSettingFilter could not be loaded', async () => {
    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.error('task', new Error('an error')),
    );

    const {result} = renderHook(() =>
      usePageFilter('somePage2', 'somePage', {fallbackFilter}),
    );

    const expectedFilter = Filter.fromString('fall=back rows=42');

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(expectedFilter.toString());
    });
  });

  test('should use default fallback filter as last resort', async () => {
    const resultingFilter = DEFAULT_FALLBACK_FILTER.copy().set('rows', '42');

    const getSetting = testing.fn().mockResolvedValue({});
    const subscribe = testing.fn();
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    const {result} = renderHook(() =>
      usePageFilter('somePage2', 'somePage', {
        fallbackFilter: DEFAULT_FALLBACK_FILTER,
      }),
    );

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(resultingFilter.toString());
    });
  });

  test('should use default rows per page if rows per page setting could not be loaded', async () => {
    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockRejectedValue(new Error('an error'));
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.error(new Error('an error')));

    const {result} = renderHook(() =>
      usePageFilter('somePage2', 'somePage', {fallbackFilter}),
    );

    const expectedFilter = Filter.fromString('fall=back rows=50');

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(expectedFilter.toString());
    });
  });

  test('should prefer pageFilter rows over defaultSettingFilter and default rows', async () => {
    const pFilter = Filter.fromString('page=filter rows=42');
    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '666'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    const {result} = renderHook(() => usePageFilter('somePage2', 'somePage'));

    const expectedFilter = Filter.fromString('page=filter rows=42');

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(expectedFilter.toString());
    });
  });

  test('should handle missing pageName argument', async () => {
    const defaultSettingFilter = Filter.fromString('foo=bar');
    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {store, renderHook} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );

    const {result} = renderHook(() =>
      // @ts-expect-error
      usePageFilter(undefined, 'somePage', {fallbackFilter}),
    );

    const expectedFilter = Filter.fromString('fall=back rows=42');

    await waitFor(() => {
      expect(result.current[0].toString()).toEqual(expectedFilter.toString());
    });
  });
});
