/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable react/prop-types */

import {describe, test, expect, testing} from '@gsa/testing';

import Filter, {DEFAULT_FALLBACK_FILTER} from 'gmp/models/filter';

import {fireEvent, rendererWith, screen} from 'web/utils/testing';

import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import usePageFilter from '../usePageFilter';
import {pageFilter} from 'web/store/pages/actions';

const TestComponent = ({fallbackFilter}) => {
  const [filter, isLoadingFilter, changeFilter, removeFilter, resetFilter] =
    usePageFilter('somePage', {fallbackFilter});
  return (
    <>
      {isLoadingFilter ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        <>
          <div data-testid="filter">{filter.toFilterString()}</div>
          <button data-testid="reset" onClick={resetFilter} />
          <button data-testid="remove" onClick={removeFilter} />
          <button
            data-testid="change"
            onClick={() => {
              changeFilter(Filter.fromString('changed=1 rows=123'));
            }}
          />
        </>
      )}
    </>
  );
};

describe('usePageFilter tests', () => {
  test('should prefer locationQuery filter over defaultSettingFilter', async () => {
    const locationQuery = {filter: 'location=query'};

    const defaultSettingFilter = Filter.fromString('foo=bar');

    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {
        getSetting,
      },
    };

    const {render, store, history} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    history.push({query: locationQuery});

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('location=query rows=42');
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

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('page=filter rows=42');
  });

  test('should use defaultSettingFilter', async () => {
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
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('foo=bar rows=42');
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

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.subscribe(subscribe);

    store.dispatch(loadingActions.success({rowsperpage: {value: '42'}}));

    render(<TestComponent fallbackFilter={fallbackFilter} />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('fall=back rows=42');
  });

  test('should use fallbackFilter if defaultSettingFilter could not be loaded', async () => {
    const fallbackFilter = Filter.fromString('fall=back');

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

    render(<TestComponent fallbackFilter={fallbackFilter} />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('fall=back rows=42');
  });

  test('should use default fallback filter as last resort', async () => {
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

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent(resultingFilter.toFilterString());
  });

  test('should use default rows per page if rows per page setting could not be loaded', async () => {
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

    render(<TestComponent fallbackFilter={fallbackFilter} />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('fall=back rows=50');
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

    const {render, store} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '666'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');

    expect(renderedFilter).toHaveTextContent('page=filter rows=42');
  });

  test('should allow to reset the filter to the defaultSettingsFilter', async () => {
    const pFilter = Filter.fromString('page=filter rows=42');
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

    store.dispatch(loadingActions.success({rowsperpage: {value: '666'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');
    const resetButton = screen.getByTestId('reset');

    expect(renderedFilter).toHaveTextContent('page=filter rows=42');

    fireEvent.click(resetButton);

    expect(renderedFilter).toHaveTextContent('foo=bar rows=666');
  });

  test('should allow to remove the filter', async () => {
    const pFilter = Filter.fromString('page=filter rows=42');
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

    store.dispatch(loadingActions.success({rowsperpage: {value: '666'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');
    const removeButton = screen.getByTestId('remove');

    expect(renderedFilter).toHaveTextContent('page=filter rows=42');

    fireEvent.click(removeButton);

    expect(renderedFilter).toHaveTextContent('first=1');
  });

  test('should allow to change the filter', async () => {
    const pFilter = Filter.fromString('page=filter rows=42');
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

    store.dispatch(loadingActions.success({rowsperpage: {value: '666'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('somePage', defaultSettingFilter),
    );
    store.dispatch(pageFilter('somePage', pFilter));

    render(<TestComponent />);

    const renderedFilter = await screen.findByTestId('filter');
    const changeButton = screen.getByTestId('change');

    expect(renderedFilter).toHaveTextContent('page=filter rows=42');

    fireEvent.click(changeButton);

    expect(renderedFilter).toHaveTextContent('changed=1 rows=123');
  });
});
