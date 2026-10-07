/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useBulkDeleteWebApplicationTargets,
  useBulkExportWebApplicationTargets,
  useGetWebApplicationTargets,
} from 'web/hooks/use-query/web-application-targets';

const filter = QueryFilter.fromString('name~target');
const target = {id: 'target-1', name: 'Target 1'};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  webapplicationtargets: {
    get: testing.fn().mockResolvedValue({
      data: [target],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
    delete: testing.fn().mockResolvedValue(undefined),
    deleteByFilter: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'targets'}),
    exportByFilter: testing.fn().mockResolvedValue({data: 'targets'}),
  },
});

describe('useGetWebApplicationTargets', () => {
  test('should fetch web application targets with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetWebApplicationTargets({filter});
      return <div data-testid="targets">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('targets')).toHaveTextContent('Target 1');
    });

    expect(gmp.webapplicationtargets.get).toHaveBeenCalledWith({filter});
  });
});

describe('useBulkDeleteWebApplicationTargets', () => {
  test('should delete web application targets by filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkDeleteWebApplicationTargets({});
      return (
        <button onClick={() => mutation.mutate(filter as never)}>Delete</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.webapplicationtargets.deleteByFilter).toHaveBeenCalledWith(
        filter,
      );
    });
  });
});

describe('useBulkExportWebApplicationTargets', () => {
  test('should export web application targets', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkExportWebApplicationTargets({});
      return (
        <button onClick={() => mutation.mutate([target] as never)}>
          Export
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));

    await waitFor(() => {
      expect(gmp.webapplicationtargets.export).toHaveBeenCalledWith([target]);
    });
  });
});
