/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import PortList from 'gmp/models/port-list';
import {createSession} from 'gmp/testing';
import {
  useBulkDeletePortLists,
  useBulkExportPortLists,
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
      delete: testing.fn().mockResolvedValue(undefined),
      deleteByFilter: testing.fn().mockResolvedValue(undefined),
      export: testing.fn().mockResolvedValue({data: 'port-lists'}),
      exportByFilter: testing.fn().mockResolvedValue({data: 'port-lists'}),
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

describe('useBulkDeletePortLists', () => {
  test('should delete port lists by list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkDeletePortLists({});
      return (
        <>
          <button onClick={() => mutation.mutate(portLists)}>
            Delete list
          </button>
          <button onClick={() => mutation.mutate(filter)}>Delete filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete list'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete filter'}));

    await waitFor(() => {
      expect(gmp.portlists.delete).toHaveBeenCalledWith(portLists);
      expect(gmp.portlists.deleteByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test('should call onError when deleting port lists fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.portlists.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkDeletePortLists({onError});
      return <button onClick={() => mutation.mutate(portLists)}>Delete</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useBulkExportPortLists', () => {
  test('should export port lists by list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkExportPortLists({});
      return (
        <>
          <button onClick={() => mutation.mutate(portLists)}>
            Export list
          </button>
          <button onClick={() => mutation.mutate(filter)}>Export filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export list'}));
    fireEvent.click(screen.getByRole('button', {name: 'Export filter'}));

    await waitFor(() => {
      expect(gmp.portlists.export).toHaveBeenCalledWith(portLists);
      expect(gmp.portlists.exportByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test('should call onError when exporting port lists fails', async () => {
    const error = new Error('Export failed');
    const gmp = createGmp();
    gmp.portlists.export.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkExportPortLists({onError});
      return <button onClick={() => mutation.mutate(portLists)}>Export</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
