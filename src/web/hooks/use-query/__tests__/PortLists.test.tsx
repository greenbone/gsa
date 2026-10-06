/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import PortList from 'gmp/models/port-list';
import {createSession} from 'gmp/testing';
import {
  useGetAllPortLists,
  useGetPortLists,
} from 'web/hooks/use-query/port-lists';

const filter = QueryFilter.fromString('name~port-list');
const portLists = [new PortList({id: 'port-list-1', name: 'Port List 1'})];

const createGmp = () => {
  const response = {
    data: portLists,
    meta: {
      filter,
      counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
    },
  };

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    portlists: {
      get: testing.fn().mockResolvedValue(response),
      getAll: testing.fn().mockResolvedValue(response),
    },
  };
};

describe('useGetPortLists', () => {
  test('should fetch port lists with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetPortLists({filter});
      return <div data-testid="port-list">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('port-list')).toHaveTextContent('Port List 1');
    });

    expect(gmp.portlists.get).toHaveBeenCalledWith({filter});
    expect(gmp.portlists.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch port lists when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetPortLists({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.portlists.get).not.toHaveBeenCalled();
  });

  test('should not fetch port lists without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetPortLists({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.portlists.get).not.toHaveBeenCalled();
  });
});

describe('useGetAllPortLists', () => {
  test('should fetch all port lists with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAllPortLists({filter});
      return <div data-testid="port-list">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('port-list')).toHaveTextContent('Port List 1');
    });

    expect(gmp.portlists.getAll).toHaveBeenCalledWith({filter});
    expect(gmp.portlists.get).not.toHaveBeenCalled();
  });

  test('should not fetch port lists when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllPortLists({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.portlists.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch port lists without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAllPortLists({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.portlists.getAll).not.toHaveBeenCalled();
  });
});
