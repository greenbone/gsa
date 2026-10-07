/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Vulnerability from 'gmp/models/vulnerability';
import {createSession} from 'gmp/testing';
import {
  useBulkDeleteVulnerabilities,
  useBulkExportVulnerabilities,
  useGetVulnerabilities,
} from 'web/hooks/use-query/vulnerabilities';

const filter = QueryFilter.fromString('severity>5');
const vulnerability = new Vulnerability({
  id: 'vulnerability-1',
  name: 'Vulnerability 1',
});

describe('useGetVulnerabilities', () => {
  test('should fetch vulnerabilities with a filter', async () => {
    const get = testing.fn().mockResolvedValue({
      data: [vulnerability],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    });
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      vulns: {get},
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetVulnerabilities({filter});
      return <div data-testid="vulnerability">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('vulnerability')).toHaveTextContent(
        'Vulnerability 1',
      );
    });

    expect(get).toHaveBeenCalledWith({filter});
  });
});

describe('useBulkDeleteVulnerabilities', () => {
  test('should bulk delete vulnerabilities by list and filter', async () => {
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      vulns: {
        delete: testing.fn().mockResolvedValue(undefined),
        deleteByFilter: testing.fn().mockResolvedValue(undefined),
      },
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const deleteMutation = useBulkDeleteVulnerabilities({});
      return (
        <>
          <button onClick={() => deleteMutation.mutate([vulnerability])}>
            Delete
          </button>
          <button onClick={() => deleteMutation.mutate(filter)}>
            Delete filter
          </button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete filter'}));

    await waitFor(() => {
      expect(gmp.vulns.delete).toHaveBeenCalledWith([vulnerability]);
      expect(gmp.vulns.deleteByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test.each(['Delete', 'Delete filter'])(
    'should call onError for the %s vulnerability bulk mutation',
    async name => {
      const error = new Error('Vulnerability bulk mutation failed');
      const gmp = {
        session: createSession({token: 'test-token'}),
        settings: {},
        vulns: {
          delete: testing.fn().mockRejectedValue(error),
          deleteByFilter: testing.fn().mockRejectedValue(error),
        },
      };
      const onError = testing.fn();
      const {render} = rendererWith({gmp, router: true});
      const TestComponent = () => {
        const remove = useBulkDeleteVulnerabilities({onError});
        return (
          <>
            <button onClick={() => remove.mutate([vulnerability])}>
              Delete
            </button>
            <button onClick={() => remove.mutate(filter)}>Delete filter</button>
          </>
        );
      };
      render(<TestComponent />);
      fireEvent.click(screen.getByRole('button', {name}));
      await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
    },
  );
});

describe('useBulkExportVulnerabilities', () => {
  test('should bulk export vulnerabilities by list and filter', async () => {
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      vulns: {
        export: testing.fn().mockResolvedValue({data: 'vulnerabilities'}),
        exportByFilter: testing
          .fn()
          .mockResolvedValue({data: 'vulnerabilities'}),
      },
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const exportMutation = useBulkExportVulnerabilities({});
      return (
        <>
          <button onClick={() => exportMutation.mutate([vulnerability])}>
            Export
          </button>
          <button onClick={() => exportMutation.mutate(filter)}>
            Export filter
          </button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));
    fireEvent.click(screen.getByRole('button', {name: 'Export filter'}));

    await waitFor(() => {
      expect(gmp.vulns.export).toHaveBeenCalledWith([vulnerability]);
      expect(gmp.vulns.exportByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test.each(['Export', 'Export filter'])(
    'should call onError for the %s vulnerability bulk mutation',
    async name => {
      const error = new Error('Vulnerability bulk mutation failed');
      const gmp = {
        session: createSession({token: 'test-token'}),
        settings: {},
        vulns: {
          export: testing.fn().mockRejectedValue(error),
          exportByFilter: testing.fn().mockRejectedValue(error),
        },
      };
      const onError = testing.fn();
      const {render} = rendererWith({gmp, router: true});
      const TestComponent = () => {
        const exportMutation = useBulkExportVulnerabilities({onError});
        return (
          <>
            <button onClick={() => exportMutation.mutate([vulnerability])}>
              Export
            </button>
            <button onClick={() => exportMutation.mutate(filter)}>
              Export filter
            </button>
          </>
        );
      };
      render(<TestComponent />);
      fireEvent.click(screen.getByRole('button', {name}));
      await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
    },
  );
});
