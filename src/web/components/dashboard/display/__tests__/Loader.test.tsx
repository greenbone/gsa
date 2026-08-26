/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import type Gmp from 'gmp/gmp';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  Loader,
  createLoadFunc,
  type LoadFuncProps,
} from 'web/components/dashboard/display/Loader';
import {
  DASHBOARD_DATA_LOADING_REQUEST,
  DASHBOARD_DATA_LOADING_SUCCESS,
  DASHBOARD_DATA_LOADING_ERROR,
} from 'web/store/dashboard/data/actions';
import {filterIdentifier} from 'web/store/utils';

interface TestData {
  foo: string;
}

type TestState = Record<string, Record<string, {isLoading: boolean}>>;

const createState = (state: TestState): {dashboardData: TestState} => ({
  dashboardData: {
    ...state,
  },
});

describe('Loader component tests', () => {
  test('should load data on mount and render children', () => {
    const load = testing.fn().mockReturnValue({type: 'LOAD'});
    const children = testing.fn().mockReturnValue(null);
    const {render} = rendererWith({store: true});

    const {container} = render(
      <Loader
        data={undefined}
        dataId="a1"
        isLoading={true}
        load={load}
        subscribe={testing.fn()}
        subscriptions={[]}
      >
        {props => {
          children(props);
          return <span>{props.isLoading ? 'loading' : 'loaded'}</span>;
        }}
      </Loader>,
    );

    expect(load).toHaveBeenCalled();
    expect(children).toHaveBeenCalledWith({
      data: undefined,
      isLoading: true,
    });
    expect(container.textContent).toContain('loading');
  });

  test('should render nothing when children are omitted', () => {
    const {render} = rendererWith({store: true});

    const {container} = render(
      <Loader
        data={[]}
        dataId="a1"
        isLoading={false}
        load={testing.fn()}
        subscribe={testing.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  test('should not load data on mount when data is available', () => {
    const load = testing.fn();
    const children = testing.fn().mockReturnValue(null);
    const {render} = rendererWith({store: true});
    const data = {foo: 'bar'};

    render(
      <Loader
        data={data}
        dataId="a1"
        isLoading={false}
        load={load}
        subscribe={testing.fn()}
        subscriptions={[]}
      >
        {children}
      </Loader>,
    );

    expect(load).not.toHaveBeenCalled();
    expect(children).toHaveBeenCalledWith({data, isLoading: false});
  });

  test('should register and clean up multiple subscriptions', () => {
    const load = testing.fn();
    const firstUnsubscribe = testing.fn();
    const secondUnsubscribe = testing.fn();
    const subscribe = testing
      .fn()
      .mockReturnValueOnce(firstUnsubscribe)
      .mockReturnValueOnce(secondUnsubscribe);
    const {render} = rendererWith({store: true});

    const {unmount} = render(
      <Loader
        data={[]}
        dataId="a1"
        isLoading={false}
        load={load}
        subscribe={subscribe}
        subscriptions={['task.changed', 'result.changed']}
      />,
    );

    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(subscribe).toHaveBeenNthCalledWith(
      1,
      'task.changed',
      expect.any(Function),
    );
    expect(subscribe).toHaveBeenNthCalledWith(
      2,
      'result.changed',
      expect.any(Function),
    );

    unmount();

    expect(firstUnsubscribe).toHaveBeenCalledTimes(1);
    expect(secondUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test('should load data when a subscription callback is triggered', () => {
    const load = testing.fn();
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const {render} = rendererWith({store: true});

    render(
      <Loader
        data={[]}
        dataId="a1"
        isLoading={false}
        load={load}
        subscribe={subscribe}
        subscriptions={['task.changed']}
      />,
    );

    expect(load).not.toHaveBeenCalled();

    const callback = subscribe.mock.calls[0][1] as () => void;
    callback();

    expect(load).toHaveBeenCalledTimes(1);
  });

  test('should not load data when rerendered with the same filter', () => {
    const load = testing.fn();
    const {render} = rendererWith({store: true});
    const filter = QueryFilter.fromString('foo=bar');

    const {rerender} = render(
      <Loader
        data={[]}
        dataId="a1"
        filter={filter}
        isLoading={false}
        load={load}
        subscribe={testing.fn()}
      />,
    );

    rerender(
      <Loader
        data={[]}
        dataId="a1"
        filter={filter}
        isLoading={false}
        load={load}
        subscribe={testing.fn()}
      />,
    );

    expect(load).not.toHaveBeenCalled();
  });

  test('should load data when the filter changes', () => {
    const load = testing.fn();
    const {render} = rendererWith({store: true});
    const firstFilter = QueryFilter.fromString('foo=bar');
    const secondFilter = QueryFilter.fromString('foo=baz');

    const {rerender} = render(
      <Loader
        data={[]}
        dataId="a1"
        filter={firstFilter}
        isLoading={false}
        load={load}
        subscribe={testing.fn()}
      />,
    );

    rerender(
      <Loader
        data={[]}
        dataId="a1"
        filter={secondFilter}
        isLoading={false}
        load={load}
        subscribe={testing.fn()}
      />,
    );

    expect(load).toHaveBeenCalledTimes(1);
  });

  test('should keep the latest data when the next data is undefined', () => {
    const children = testing.fn().mockReturnValue(null);
    const {render} = rendererWith({store: true});
    const data = {foo: 'bar'};

    const {rerender} = render(
      <Loader
        data={data}
        dataId="a1"
        isLoading={false}
        load={testing.fn()}
        subscribe={testing.fn()}
      >
        {children}
      </Loader>,
    );

    rerender(
      <Loader
        data={undefined}
        dataId="a1"
        isLoading={true}
        load={testing.fn()}
        subscribe={testing.fn()}
      >
        {children}
      </Loader>,
    );

    expect(children).toHaveBeenLastCalledWith({data, isLoading: true});
  });
});

describe('createLoadFunc tests', () => {
  test('should request dashboard data successfully', () => {
    const data: TestData = {
      foo: 'bar',
    };
    const func = testing.fn((_props: LoadFuncProps): Promise<TestData> =>
      Promise.resolve(data),
    );

    const id = 'a1';
    const filter = QueryFilter.fromString('foo=bar');
    const props: LoadFuncProps = {
      filter,
      gmp: {} as Gmp,
    };
    const thunk = createLoadFunc(func, id)(props);
    const dispatch = testing.fn() as Parameters<typeof thunk>[0];
    const getState = testing.fn() as Parameters<typeof thunk>[1];

    return thunk(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).toHaveBeenCalledWith(props);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: DASHBOARD_DATA_LOADING_REQUEST,
        id,
        filter,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_SUCCESS,
        id,
        filter,
        data,
      });
    });
  });

  test('should not load if data is already loading', () => {
    const id = 'a1';
    const filter = QueryFilter.fromString('foo=bar');
    const filterString = filterIdentifier(filter);
    const state = createState({
      [id]: {
        [filterString]: {
          isLoading: true,
        },
      },
    });
    const data: TestData = {
      foo: 'bar',
    };
    const func = testing.fn((_props: LoadFuncProps): Promise<TestData> =>
      Promise.resolve(data),
    );

    const props: LoadFuncProps = {
      filter,
      gmp: {} as Gmp,
    };
    const thunk = createLoadFunc(func, id)(props);
    const dispatch = testing.fn() as Parameters<typeof thunk>[0];
    const getState = testing.fn().mockReturnValue(state) as Parameters<
      typeof thunk
    >[1];

    return thunk(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  test('should fail loading dashboard data', () => {
    const id = 'a1';
    const filter = QueryFilter.fromString('foo=bar');
    const func = testing.fn((_props: LoadFuncProps): Promise<TestData> =>
      Promise.reject('An error'),
    );

    const props: LoadFuncProps = {
      filter,
      gmp: {} as Gmp,
    };
    const thunk = createLoadFunc(func, id)(props);
    const dispatch = testing.fn() as Parameters<typeof thunk>[0];
    const getState = testing.fn() as Parameters<typeof thunk>[1];

    return thunk(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).toHaveBeenCalledWith(props);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: DASHBOARD_DATA_LOADING_REQUEST,
        id,
        filter,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_ERROR,
        id,
        filter,
        error: 'An error',
      });
    });
  });
});
