/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Tag from 'gmp/models/tag';
import {createSession} from 'gmp/testing';
import {
  useBulkDeleteTags,
  useBulkExportTags,
  useGetTags,
} from 'web/hooks/use-query/tags';

const filter = QueryFilter.fromString('name~tag');
const tag = new Tag({id: 'tag-1', name: 'Tag 1', value: 'value'});

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  tags: {
    get: testing.fn().mockResolvedValue({
      data: [tag],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
    delete: testing.fn().mockResolvedValue(undefined),
    deleteByFilter: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'tags'}),
    exportByFilter: testing.fn().mockResolvedValue({data: 'tags'}),
  },
});

describe('useGetTags', () => {
  test('should fetch tags with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const {data} = useGetTags({filter});
      return <div data-testid="tags">{data?.entities.length}</div>;
    };

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId('tags')).toHaveTextContent('1');
    });
    expect(gmp.tags.get).toHaveBeenCalledWith({filter});
  });
});

describe('useBulkDeleteTags', () => {
  test('should bulk delete tags by list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkDeleteTags({});
      return (
        <>
          <button onClick={() => mutation.mutate([tag])}>Delete</button>
          <button onClick={() => mutation.mutate(filter)}>Delete filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete filter'}));
    await waitFor(() => {
      expect(gmp.tags.delete).toHaveBeenCalledWith([tag]);
      expect(gmp.tags.deleteByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test('should call onError when deleting tags fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.tags.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkDeleteTags({onError});
      return <button onClick={() => mutation.mutate([tag])}>Delete</button>;
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useBulkExportTags', () => {
  test('should bulk export tags by list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkExportTags({});
      return (
        <>
          <button onClick={() => mutation.mutate([tag])}>Export</button>
          <button onClick={() => mutation.mutate(filter)}>Export filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));
    fireEvent.click(screen.getByRole('button', {name: 'Export filter'}));
    await waitFor(() => {
      expect(gmp.tags.export).toHaveBeenCalledWith([tag]);
      expect(gmp.tags.exportByFilter).toHaveBeenCalledWith(filter);
    });
  });

  test('should call onError when exporting tags fails', async () => {
    const error = new Error('Export failed');
    const gmp = createGmp();
    gmp.tags.export.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkExportTags({onError});
      return <button onClick={() => mutation.mutate([tag])}>Export</button>;
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
