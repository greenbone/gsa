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
  useCloneTag,
  useCreateTag,
  useDeleteTag,
  useDisableTag,
  useEnableTag,
  useGetTag,
  useGetTags,
  useSaveTag,
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
  tag: {
    get: testing.fn().mockResolvedValue({data: tag}),
    delete: testing.fn().mockResolvedValue(undefined),
    enable: testing.fn().mockResolvedValue({data: {}}),
    disable: testing.fn().mockResolvedValue({data: {}}),
    create: testing.fn().mockResolvedValue({data: {id: 'tag-2'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'tag-1'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'tag-2'}}),
  },
});

describe('tag query and mutation hooks', () => {
  test('should fetch tags and a tag by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const tags = useGetTags({filter});
      const singleTag = useGetTag({id: 'tag-1'});
      return (
        <div data-testid="tags">
          {tags.data?.entities.length}:{singleTag.data?.name}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('tags')).toHaveTextContent('1:Tag 1');
    });

    expect(gmp.tags.get).toHaveBeenCalledWith({filter});
    expect(gmp.tag.get).toHaveBeenCalledWith({id: 'tag-1'});
  });

  test.each([
    ['delete', useDeleteTag, 'delete', {id: 'tag-1'}],
    ['enable', useEnableTag, 'enable', {id: 'tag-1'}],
    ['disable', useDisableTag, 'disable', {id: 'tag-1'}],
    ['create', useCreateTag, 'create', {name: 'New Tag', value: 'value'}],
    ['save', useSaveTag, 'save', {id: 'tag-1', name: 'Saved Tag'}],
    ['clone', useCloneTag, 'clone', {id: 'tag-1'}],
  ])('should %s a tag', async (_name, useMutation, method, input) => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useMutation({});
      return (
        <button onClick={() => mutation.mutate(input as never)}>Run</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.tag[method]).toHaveBeenCalledWith(input);
    });
  });

  test('should bulk delete and export tags by list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const deleteMutation = useBulkDeleteTags({});
      const exportMutation = useBulkExportTags({});
      return (
        <>
          <button onClick={() => deleteMutation.mutate([tag])}>Delete</button>
          <button onClick={() => deleteMutation.mutate(filter)}>
            Delete filter
          </button>
          <button onClick={() => exportMutation.mutate([tag])}>Export</button>
          <button onClick={() => exportMutation.mutate(filter)}>
            Export filter
          </button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete filter'}));
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));
    fireEvent.click(screen.getByRole('button', {name: 'Export filter'}));

    await waitFor(() => {
      expect(gmp.tags.delete).toHaveBeenCalledWith([tag]);
      expect(gmp.tags.deleteByFilter).toHaveBeenCalledWith(filter);
      expect(gmp.tags.export).toHaveBeenCalledWith([tag]);
      expect(gmp.tags.exportByFilter).toHaveBeenCalledWith(filter);
    });
  });
});
