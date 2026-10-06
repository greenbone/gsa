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
  useCloneWebApplicationTarget,
  useCreateWebApplicationTarget,
  useDeleteWebApplicationTarget,
  useGetWebApplicationTargets,
  useSaveWebApplicationTarget,
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
  webapplicationtarget: {
    create: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'target-1'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    clone: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
  },
});

describe('web application target query hooks', () => {
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

  test('should forward web application target mutations', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {name: 'New Target', urls: 'https://example.com'};

    const TestComponent = () => {
      const create = useCreateWebApplicationTarget({});
      const save = useSaveWebApplicationTarget({});
      const remove = useDeleteWebApplicationTarget({});
      const clone = useCloneWebApplicationTarget({});
      const bulkDelete = useBulkDeleteWebApplicationTargets({});
      const bulkExport = useBulkExportWebApplicationTargets({});
      return (
        <>
          <button onClick={() => create.mutate(input)}>Create</button>
          <button onClick={() => save.mutate({id: 'target-1', name: 'Saved'})}>
            Save
          </button>
          <button
            onClick={() => remove.mutate({id: 'target-1', name: 'Target 1'})}
          >
            Delete
          </button>
          <button
            onClick={() =>
              clone.mutate({id: 'target-1', name: 'Cloned Target'})
            }
          >
            Clone
          </button>
          <button onClick={() => bulkDelete.mutate(filter as never)}>
            Bulk delete
          </button>
          <button onClick={() => bulkExport.mutate([target] as never)}>
            Bulk export
          </button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));
    fireEvent.click(screen.getByRole('button', {name: 'Bulk delete'}));
    fireEvent.click(screen.getByRole('button', {name: 'Bulk export'}));

    await waitFor(() => {
      expect(gmp.webapplicationtarget.create.mock.calls[0][0]).toEqual(input);
      expect(gmp.webapplicationtarget.save.mock.calls[0][0]).toEqual({
        id: 'target-1',
        name: 'Saved',
      });
      expect(gmp.webapplicationtarget.delete).toHaveBeenCalledWith({
        id: 'target-1',
      });
      expect(gmp.webapplicationtarget.clone).toHaveBeenCalledWith({
        id: 'target-1',
      });
      expect(gmp.webapplicationtargets.deleteByFilter).toHaveBeenCalledWith(
        filter,
      );
      expect(gmp.webapplicationtargets.export).toHaveBeenCalledWith([target]);
    });
  });
});
