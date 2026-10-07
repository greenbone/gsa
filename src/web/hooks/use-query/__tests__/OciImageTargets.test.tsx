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
  useBulkDeleteOciImageTargets,
  useBulkExportOciImageTargets,
  useGetOciImageTargets,
} from 'web/hooks/use-query/oci-image-targets';

const filter = QueryFilter.fromString('name~target');
const target = {id: 'target-1', name: 'Target 1'};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  ociimagetargets: {
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

describe('useGetOciImageTargets', () => {
  test('should fetch OCI image targets with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetOciImageTargets({filter});
      return <div data-testid="targets">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('targets')).toHaveTextContent('Target 1');
    });

    expect(gmp.ociimagetargets.get).toHaveBeenCalledWith({filter});
  });
});

describe('useBulkDeleteOciImageTargets', () => {
  test('should delete OCI image targets', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkDeleteOciImageTargets({});
      return (
        <button onClick={() => mutation.mutate([target] as never)}>
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.ociimagetargets.delete).toHaveBeenCalledWith([target]);
    });
  });
});

describe('useBulkExportOciImageTargets', () => {
  test('should export OCI image targets by filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkExportOciImageTargets({});
      return (
        <button onClick={() => mutation.mutate(filter as never)}>Export</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));

    await waitFor(() => {
      expect(gmp.ociimagetargets.exportByFilter).toHaveBeenCalledWith(filter);
    });
  });
});
