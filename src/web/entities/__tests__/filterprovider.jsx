/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter, {DEFAULT_FALLBACK_FILTER} from 'gmp/models/filter';
import {beforeEach, vi} from 'vitest';
import {pageFilter} from 'web/store/pages/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, screen} from 'web/utils/testing';

import FilterProvider from '../filterprovider';

let mockSearchParams = {};
const mockUseNavigate = vi.fn();
const mockUseSearchParams = vi
  .fn()
  .mockReturnValue([
    {get: key => mockSearchParams[key]},
    {set: (key, value) => (mockSearchParams[key] = value)},
  ]);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
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

describe('FilterProvider component tests', () => {
  test('should prefer search params filter over defaultSettingFilter', async () => {
    const resultingFilter = Filter.fromString('location=query rows=42');

    mockSearchParams['filter'] = 'location=query';

    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(<FilterProvider gmpname="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should prefer pageFilter over defaultSettingFilter', async () => {
    const resultingFilter = Filter.fromString('page=filter rows=42');

    const pFilter = Filter.fromString('page=filter');

    const emptyFilter = Filter.fromString('rows=42');

    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );
    store.dispatch(pageFilter('task', pFilter));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(<FilterProvider gmpname="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should allow to set a pageName for loading the pageFilter', async () => {
    const gmpName = 'task';
    const pageName = 'foo-bar-baz';
    const resultingFilter = Filter.fromString('page=filter rows=42');

    const pFilter = Filter.fromString('page=filter');

    const emptyFilter = Filter.fromString('rows=42');

    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(gmpName, defaultSettingFilter),
    );
    store.dispatch(pageFilter(pageName, pFilter));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(
      <FilterProvider gmpname={gmpName} pageName={pageName}>
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use defaultSettingFilter', async () => {
    const resultingFilter = Filter.fromString('foo=bar rows=42');

    const defaultSettingFilter = Filter.fromString('foo=bar');

    const emptyFilter = Filter.fromString('rows=42');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(<FilterProvider gmpname="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use fallbackFilter if defaultSettingFilter could not be loaded', async () => {
    const resultingFilter = Filter.fromString('fall=back rows=42');

    const fallbackFilter = Filter.fromString('fall=back');

    const emptyFilter = Filter.fromString('rows=42');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.error('task', new Error('an error')),
    );

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(
      <FilterProvider fallbackFilter={fallbackFilter} gmpname="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use fallbackFilter if given', async () => {
    // if no usersettings defaultFilter exists use the given fallbackFilter
    const resultingFilter = Filter.fromString('fall=back rows=42');

    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockResolvedValue({});
    const subscribe = testing.fn();
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(
      <FilterProvider fallbackFilter={fallbackFilter} gmpname="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should use default fallbackFilter as last resort', async () => {
    const resultingFilter = DEFAULT_FALLBACK_FILTER.copy().set('rows', 42);

    const getSetting = testing.fn().mockResolvedValue({});
    const subscribe = testing.fn();
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(<FilterProvider gmpname="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should not overwrite rows keyword', async () => {
    // if rows= is set already, don't overwrite it. FilterProvider makes sure
    // that rows is always set to the usersettings rowsperpage.value
    const resultingFilter = Filter.fromString('fall=back rows=21');
    // use fallbackFilter as sample
    const fallbackFilter = Filter.fromString('fall=back rows=21');

    const getSetting = testing.fn().mockResolvedValue({});
    const subscribe = testing.fn();
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(
      <FilterProvider fallbackFilter={fallbackFilter} gmpname="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should use default rows per page if rows per page setting could not be loaded', async () => {
    const resultingFilter = Filter.fromString('fall=back rows=50');
    const fallbackFilter = Filter.fromString('fall=back');

    const getSetting = testing.fn().mockRejectedValue(new Error('an error'));
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.error(new Error('an error')));

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(
      <FilterProvider fallbackFilter={fallbackFilter} gmpname="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });
});
