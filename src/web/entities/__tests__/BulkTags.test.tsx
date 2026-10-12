/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  within,
  rendererWith,
  fireEvent,
  getSelectItemElementsForSelect,
  wait,
  waitFor,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import BulkTags from 'web/entities/BulkTags';
import SelectionType from 'web/utils/selection-type';

interface GmpOverrides {
  createTag?: ReturnType<typeof testing.fn>;
  getAllResourceNames?: ReturnType<typeof testing.fn>;
  getTags?: ReturnType<typeof testing.fn>;
  getTag?: ReturnType<typeof testing.fn>;
  saveTag?: ReturnType<typeof testing.fn>;
}

const createGmp = ({
  createTag = testing.fn().mockResolvedValue({data: {id: '2'}}),
  getAllResourceNames = testing.fn().mockResolvedValue({data: []}),
  getTags = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      counts: new CollectionCounts({all: 0, filtered: 0, length: 0}),
      filter: QueryFilter.fromString(),
    },
  }),
  getTag = testing.fn().mockResolvedValue({data: new Tag({id: '2'})}),
  saveTag = testing.fn().mockResolvedValue({data: {id: '2'}}),
}: GmpOverrides = {}) => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  tags: {get: getTags},
  resourcenames: {getAll: getAllResourceNames},
  tag: {
    create: createTag,
    get: getTag,
    save: saveTag,
  },
});

describe('BulkTags tests', () => {
  test('should show an error when loading tags fails', async () => {
    const error = new Error('Failed to load tags');
    const getTags = testing.fn().mockRejectedValue(error);
    const gmp = createGmp({getTags});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={testing.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getDialog()).toBeInTheDocument();
      expect(screen.getDialogContent()).toHaveTextContent(
        'Failed to load tags',
      );
    });
  });

  test('should show an error when loading the selected tag fails', async () => {
    const getTags = testing.fn().mockResolvedValue({
      data: [
        new Tag({id: '1', name: 'Tag 1'}),
        new Tag({id: '2', name: 'Tag 2'}),
      ],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
        filter: QueryFilter.fromString(),
      },
    });
    const getTag = testing
      .fn()
      .mockRejectedValue(new Error('Failed to load selected tag'));
    const gmp = createGmp({getTags, getTag});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={testing.fn()}
      />,
    );

    const selectItems = await getSelectItemElementsForSelect(
      screen.getSelectElement(),
    );
    fireEvent.click(selectItems[1]);

    await waitFor(() => {
      expect(getTag).toHaveBeenCalledWith({id: '2'});
      expect(screen.getDialogContent()).toHaveTextContent(
        'Failed to load selected tag',
      );
    });
  });

  test('should render the BulkTags component', async () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = QueryFilter.fromString();
    const selectedEntities = [];
    const onClose = testing.fn();
    const getTags = testing.fn().mockResolvedValue({
      data: [new Tag({id: '1'})],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
        filter: QueryFilter.fromString(),
      },
    });
    const gmp = createGmp({getTags});
    const {render} = rendererWith({gmp, store: true});
    render(
      <BulkTags
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        selectedEntities={selectedEntities}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );
    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(getTags).toHaveBeenCalled());
    expect(getTags.mock.calls[0][0].filter.toFilterString()).toContain(
      'resource_type=task',
    );
  });

  test('should render when optional entity data is undefined', async () => {
    const entities = [new Task({id: '1'})];
    const filter = QueryFilter.fromString();
    const onClose = testing.fn();
    const getTags = testing.fn().mockResolvedValue({
      data: [],
      meta: {
        counts: new CollectionCounts({all: 0, filtered: 0, length: 0}),
        filter: QueryFilter.fromString(),
      },
    });
    const gmp = createGmp({getTags});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={entities}
        entitiesCounts={undefined}
        filter={filter}
        selectedEntities={undefined}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent(
      'Add Tag to Page Contents',
    );
    await waitFor(() => expect(getTags).toHaveBeenCalled());
    expect(getTags.mock.calls[0][0].filter.toFilterString()).toContain(
      'resource_type=task',
    );
  });

  test('should not render when entities are undefined', () => {
    const filter = QueryFilter.fromString();
    const onClose = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={undefined}
        entitiesCounts={undefined}
        filter={filter}
        selectedEntities={undefined}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should allow to tag all filtered entities', () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = QueryFilter.fromString();
    const selectedEntities = [];
    const onClose = testing.fn();
    const getTags = testing.fn().mockResolvedValue({
      data: [new Tag({id: '1'})],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
        filter: QueryFilter.fromString(),
      },
    });
    const gmp = createGmp({getTags});
    const {render} = rendererWith({gmp, store: true});
    render(
      <BulkTags
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        selectedEntities={selectedEntities}
        selectionType={SelectionType.SELECTION_FILTER}
        onClose={onClose}
      />,
    );
    const title = screen.getDialogTitle();
    expect(title).toHaveTextContent('Add Tag to All Filtered');
  });

  test('should save a tag for all filtered entities', async () => {
    const entities = [new Task({id: '1'})];
    const filter = QueryFilter.fromString('name~task');
    const saveTag = testing.fn().mockResolvedValue({data: {id: '1'}});
    const gmp = createGmp({saveTag});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={entities}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={filter}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_FILTER}
        onClose={testing.fn()}
      />,
    );

    fireEvent.click(screen.getDialogSaveButton());

    await waitFor(() =>
      expect(saveTag).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: filter.all().toFilterString(),
          resourceIds: undefined,
        }),
      ),
    );
  });

  test('should save a tag for selected entities', async () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const selectedEntities = [entities[0]];
    const saveTag = testing.fn().mockResolvedValue({data: {id: '1'}});
    const gmp = createGmp({saveTag});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={entities}
        entitiesCounts={new CollectionCounts({filtered: 2, all: 2})}
        filter={QueryFilter.fromString()}
        selectedEntities={selectedEntities}
        selectionType={SelectionType.SELECTION_USER}
        onClose={testing.fn()}
      />,
    );

    expect(screen.getDialogTitle()).toHaveTextContent('Add Tag to Selection');
    fireEvent.click(screen.getDialogSaveButton());

    await waitFor(() =>
      expect(saveTag).toHaveBeenCalledWith(
        expect.objectContaining({resourceIds: ['1']}),
      ),
    );
  });

  test('should show an error when saving a tag fails', async () => {
    const error = new Error('Failed to save tag');
    const saveTag = testing.fn().mockRejectedValue(error);
    const onClose = testing.fn();
    const gmp = createGmp({saveTag});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getDialogSaveButton());

    await waitFor(() => {
      expect(saveTag).toHaveBeenCalled();
      expect(screen.getDialogContent()).toHaveTextContent('Failed to save tag');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('should support selected entities provided as a set', () => {
    const entities = [new Task({id: '1'})];
    const selectedEntities = new Set(entities);
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={entities}
        entitiesCounts={undefined}
        filter={QueryFilter.fromString()}
        selectedEntities={selectedEntities as unknown as Task[]}
        selectionType={SelectionType.SELECTION_USER}
        onClose={testing.fn()}
      />,
    );

    expect(screen.getDialogTitle()).toHaveTextContent('Add Tag to Selection');
  });

  test('should load a tag when it is selected', async () => {
    const getTags = testing.fn().mockResolvedValue({
      data: [new Tag({id: '1'}), new Tag({id: '2'})],
      meta: {
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
        filter: QueryFilter.fromString(),
      },
    });
    const getTag = testing.fn().mockResolvedValue({
      data: new Tag({id: '2', name: 'Selected tag'}),
    });
    const gmp = createGmp({getTags, getTag});
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={testing.fn()}
      />,
    );

    const select = screen.getSelectElement();
    const items = await getSelectItemElementsForSelect(select);
    fireEvent.click(items[1]);

    await waitFor(() => expect(getTag).toHaveBeenCalledWith({id: '2'}));
  });

  test('should allow to tag tasks with a new tag', async () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = QueryFilter.fromString();
    const selectedEntities = [new Task({id: '1'})];
    const onClose = testing.fn();
    const createTag = testing.fn().mockResolvedValue({data: {id: '2'}});
    const getTag = testing.fn().mockResolvedValue({data: new Tag({id: '2'})});
    const getTags = testing.fn().mockResolvedValue({
      data: [new Tag({id: '1'})],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
        filter: QueryFilter.fromString(),
      },
    });
    const getAllResourceNames = testing.fn().mockResolvedValue({data: []});
    const saveTag = testing.fn().mockResolvedValue({data: {id: '2'}});
    const gmp = createGmp({
      createTag,
      getAllResourceNames,
      getTags,
      getTag,
      saveTag,
    });
    const {render} = rendererWith({gmp, store: true});
    render(
      <BulkTags
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        selectedEntities={selectedEntities}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );

    const tagsDialog = within(screen.getDialog());
    const newTag = tagsDialog.getByTitle('Create a new Tag');
    fireEvent.click(newTag);
    expect(getAllResourceNames).toHaveBeenCalledWith({
      resourceType: 'task',
    });

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(2);

    const tagDialog = within(dialogs[1]);
    const saveTagButton = tagDialog.getDialogSaveButton();
    fireEvent.click(saveTagButton);

    await wait();

    expect(createTag).toHaveBeenCalledWith({
      active: true,
      comment: '',
      name: 'default:unnamed',
      resourceIds: ['1'],
      resourceType: 'task',
      value: '',
    });
    expect(getTag).toHaveBeenCalledWith({id: '2'});

    const saveTagsButton = tagsDialog.getDialogSaveButton();
    fireEvent.click(saveTagsButton);

    await waitFor(() =>
      expect(saveTag).toHaveBeenCalledWith({
        active: true,
        comment: '',
        filter: undefined,
        id: '2',
        name: undefined,
        resourceIds: ['1', '2'],
        resourceType: 'task',
        resourcesAction: 'add',
        value: '',
      }),
    );
  });

  test('should show an error when creating a new tag fails', async () => {
    const createTag = testing
      .fn()
      .mockRejectedValue(new Error('Failed to create tag'));
    const gmp = createGmp({
      createTag,
      getAllResourceNames: testing.fn().mockResolvedValue({data: []}),
    });
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[new Task({id: '1'})]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={testing.fn()}
      />,
    );

    fireEvent.click(within(screen.getDialog()).getByTitle('Create a new Tag'));
    const dialogs = screen.getAllByRole('dialog');
    fireEvent.click(within(dialogs[1]).getDialogSaveButton());

    await waitFor(() => {
      expect(createTag).toHaveBeenCalled();
      expect(
        within(dialogs[0]).getByText('Failed to create tag'),
      ).toBeInTheDocument();
    });
  });

  test('should close the tag dialog', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={testing.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Create a new Tag'));
    const dialogs = screen.getAllByRole('dialog');
    fireEvent.click(within(dialogs[1]).getDialogCloseButton());

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  test('should close the BulkTags dialog', () => {
    const onClose = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(
      <BulkTags
        entities={[new Task({id: '1'})]}
        entitiesCounts={new CollectionCounts({filtered: 1, all: 1})}
        filter={QueryFilter.fromString()}
        selectedEntities={[]}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalled();
  });
});
