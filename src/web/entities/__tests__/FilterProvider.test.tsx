/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {DEFAULT_FALLBACK_FILTER} from 'gmp/models/filter';
import BaseFilter from 'gmp/models/filter/base-filter';
import FilterProvider from 'web/entities/FilterProvider';
import {pageFilter} from 'web/store/pages/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

describe('FilterProvider component tests', () => {
  test('should prefer search params filter over defaultSettingFilter', async () => {
    const resultingFilter = BaseFilter.fromString('location=query rows=42');
    const defaultSettingFilter = BaseFilter.fromString('foo=bar');

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
      route: '/task?filter=location=query',
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const renderFunc = testing
      .fn()
      .mockReturnValue(<span data-testid="awaiting-span" />);

    render(<FilterProvider gmpName="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should prefer pageFilter over defaultSettingFilter', async () => {
    const resultingFilter = BaseFilter.fromString('page=filter rows=42');

    const pFilter = BaseFilter.fromString('page=filter');

    const emptyFilter = BaseFilter.fromString('rows=42');

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');

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

    render(<FilterProvider gmpName="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should allow to set a pageName for loading the pageFilter', async () => {
    const gmpName = 'task';
    const pageName = 'foo-bar-baz';
    const resultingFilter = BaseFilter.fromString('page=filter rows=42');

    const pFilter = BaseFilter.fromString('page=filter');

    const emptyFilter = BaseFilter.fromString('rows=42');

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');

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
      <FilterProvider gmpName={gmpName} pageName={pageName}>
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use defaultSettingFilter', async () => {
    const resultingFilter = BaseFilter.fromString('foo=bar rows=42');

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');

    const emptyFilter = BaseFilter.fromString('rows=42');

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

    render(<FilterProvider gmpName="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use fallbackFilter if defaultSettingFilter could not be loaded', async () => {
    const resultingFilter = BaseFilter.fromString('fall=back rows=42');

    const fallbackFilter = BaseFilter.fromString('fall=back');

    const emptyFilter = BaseFilter.fromString('rows=42');

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
      <FilterProvider fallbackFilter={fallbackFilter} gmpName="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
    expect(renderFunc).not.toHaveBeenCalledWith({filter: emptyFilter});
  });

  test('should use fallbackFilter if given', async () => {
    // if no usersettings defaultFilter exists use the given fallbackFilter
    const resultingFilter = BaseFilter.fromString('fall=back rows=42');

    const fallbackFilter = BaseFilter.fromString('fall=back');

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
      <FilterProvider fallbackFilter={fallbackFilter} gmpName="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should use default fallbackFilter as last resort', async () => {
    const resultingFilter = DEFAULT_FALLBACK_FILTER.set('rows', 42);

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

    render(<FilterProvider gmpName="task">{renderFunc}</FilterProvider>);

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should not overwrite rows keyword', async () => {
    // if rows= is set already, don't overwrite it. FilterProvider makes sure
    // that rows is always set to the usersettings rowsperpage.value
    const resultingFilter = BaseFilter.fromString('fall=back rows=21');
    // use fallbackFilter as sample
    const fallbackFilter = BaseFilter.fromString('fall=back rows=21');

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
      <FilterProvider fallbackFilter={fallbackFilter} gmpName="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });

  test('should use default rows per page if rows per page setting could not be loaded', async () => {
    const resultingFilter = BaseFilter.fromString('fall=back rows=50');
    const fallbackFilter = BaseFilter.fromString('fall=back');

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
      <FilterProvider fallbackFilter={fallbackFilter} gmpName="task">
        {renderFunc}
      </FilterProvider>,
    );

    await screen.findByTestId('awaiting-span');

    expect(renderFunc).toHaveBeenCalledWith({filter: resultingFilter});
  });
});
