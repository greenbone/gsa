/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import {type EntitiesMeta} from 'gmp/commands/entities';
import {type HttpCommandInputParams} from 'gmp/commands/http';
import Response from 'gmp/http/response';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import useGetEntities from 'web/queries/useGetEntities';

const filter = QueryFilter.fromString('name~entity');
type TestEntity = {id: string; name: string};
const entities: TestEntity[] = [{id: 'entity-1', name: 'Entity 1'}];
const counts = new CollectionCounts({all: 1, filtered: 1, length: 1});

const createGmp = (token = 'test-token') => ({
  session: createSession({token}),
  settings: {},
});

const createGmpMethod = () =>
  testing
    .fn<
      (
        input: HttpCommandInputParams,
      ) => Promise<Response<TestEntity[], EntitiesMeta>>
    >()
    .mockResolvedValue(new Response(entities, {counts, filter}));

describe('useGetEntities', () => {
  test('should fetch entities and map the response data', async () => {
    const gmpMethod = createGmpMethod();
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      const {data} = useGetEntities({
        filter,
        gmpMethod,
        queryId: 'get_entities',
      });

      return (
        <>
          <div data-testid="entity">{data?.entities[0]?.name}</div>
          <div data-testid="count">{data?.entitiesCounts.filtered}</div>
        </>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('entity')).toHaveTextContent('Entity 1');
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(gmpMethod).toHaveBeenCalledWith({filter});
  });

  test('should report loading and fetching while the initial request is pending', async () => {
    let resolveRequest:
      | ((response: Response<TestEntity[], EntitiesMeta>) => void)
      | undefined;
    const request = new Promise<Response<TestEntity[], EntitiesMeta>>(
      resolve => {
        resolveRequest = resolve;
      },
    );
    const gmpMethod = createGmpMethod().mockReturnValue(request);
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      const {isFetching, isLoading} = useGetEntities({
        gmpMethod,
        queryId: 'get_entities_loading',
      });

      return (
        <>
          <div data-testid="is-loading">{String(isLoading)}</div>
          <div data-testid="is-fetching">{String(isFetching)}</div>
        </>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('true');

    resolveRequest?.(new Response(entities, {counts, filter}));

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-fetching')).toHaveTextContent('false');
    });
  });

  test('should report fetching without loading during a refetch', async () => {
    let resolveRefetch!: (
      response: Response<TestEntity[], EntitiesMeta>,
    ) => void;
    const refetch = new Promise<Response<TestEntity[], EntitiesMeta>>(
      resolve => {
        resolveRefetch = resolve;
      },
    );
    let callCount = 0;
    const gmpMethod = createGmpMethod().mockImplementation(() => {
      callCount += 1;
      return callCount === 1
        ? Promise.resolve(new Response(entities, {counts, filter}))
        : refetch;
    });
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      const {isFetching, isLoading} = useGetEntities({
        gmpMethod,
        queryId: 'get_entities_refetching',
        refetchInterval: 20,
      });

      return (
        <>
          <div data-testid="is-loading">{String(isLoading)}</div>
          <div data-testid="is-fetching">{String(isFetching)}</div>
        </>
      );
    };

    render(<TestComponent />);

    await waitFor(() => expect(gmpMethod).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(gmpMethod).toHaveBeenCalledTimes(2));

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('true');

    resolveRefetch(new Response(entities, {counts, filter}));

    await waitFor(() =>
      expect(screen.getByTestId('is-fetching')).toHaveTextContent('false'),
    );
  });

  test('should memoize the returned query object when the error is unchanged', async () => {
    const error = new Error('Request failed');
    const gmpMethod = createGmpMethod().mockRejectedValue(error);
    const {renderHook} = rendererWith({
      gmp: createGmp(),
      router: true,
    });

    const {rerender, result} = renderHook(() =>
      useGetEntities({
        gmpMethod,
        queryId: 'get_entities_memoized',
      }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));

    const initialQueryResult = result.current;
    rerender();

    expect(result.current).toBe(initialQueryResult);
  });

  test('should not fetch when disabled', () => {
    const gmpMethod = testing.fn();
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      useGetEntities({enabled: false, gmpMethod, queryId: 'get_entities'});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmpMethod).not.toHaveBeenCalled();
  });

  test('should not fetch without a session token', () => {
    const gmpMethod = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(''),
      router: true,
    });

    const TestComponent = () => {
      useGetEntities({gmpMethod, queryId: 'get_entities'});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmpMethod).not.toHaveBeenCalled();
  });

  test('should expose errors from the GMP method', async () => {
    const error = new Error('Request failed');
    const gmpMethod = testing.fn().mockRejectedValue(error);
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      const {error: queryError, isError} = useGetEntities({
        gmpMethod,
        queryId: 'get_entities',
      });

      return (
        <div data-testid="error">
          {isError ? queryError?.message : String(queryError)}
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('error')).toHaveTextContent('undefined');

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Request failed');
    });
  });

  test('should use a number as the refetch interval', async () => {
    const gmpMethod = createGmpMethod();
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      useGetEntities({
        gmpMethod,
        queryId: 'get_entities_interval',
        refetchInterval: 20,
      });
      return <div />;
    };

    render(<TestComponent />);
    await waitFor(() => expect(gmpMethod).toHaveBeenCalledTimes(1));
    gmpMethod.mockClear();

    await waitFor(() => expect(gmpMethod).toHaveBeenCalled());
  });

  test('should disable refetching with a false interval', async () => {
    const gmpMethod = createGmpMethod();
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      useGetEntities({
        gmpMethod,
        queryId: 'get_entities_disabled_interval',
        refetchInterval: false,
      });
      return <div />;
    };

    render(<TestComponent />);
    await waitFor(() => expect(gmpMethod).toHaveBeenCalledTimes(1));
    gmpMethod.mockClear();

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(gmpMethod).not.toHaveBeenCalled();
  });

  test('should use a function result as the refetch interval', async () => {
    const gmpMethod = createGmpMethod();
    const refetchInterval = testing.fn().mockReturnValue(20);
    const {render} = rendererWith({gmp: createGmp(), router: true});

    const TestComponent = () => {
      useGetEntities({
        gmpMethod,
        queryId: 'get_entities_function_interval',
        refetchInterval,
      });
      return <div />;
    };

    render(<TestComponent />);
    await waitFor(() => expect(gmpMethod).toHaveBeenCalled());
    gmpMethod.mockClear();

    await waitFor(() => expect(gmpMethod).toHaveBeenCalled());
    expect(refetchInterval).toHaveBeenCalled();
    expect(gmpMethod).toHaveBeenCalled();
  });
});
