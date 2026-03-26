/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  wait,
  within,
} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import CollectionCounts from 'gmp/collection/collection-counts';
import dayjs from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';
import {YES_VALUE} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TagsListPage from 'web/pages/tags/TagListPage';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({filter: null});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
  }),
);

const createTag = (id = 'tag1') =>
  new Tag({
    id,
    name: 'test tag',
    value: 'test value',
    active: YES_VALUE,
    resourceType: 'target',
    resourceCount: 5,
    creationTime: dayjs('2025-01-01T00:00:00Z'),
    modificationTime: dayjs('2025-01-02T00:00:00Z'),
    owner: {name: 'admin'},
    userCapabilities: new EverythingCapabilities(),
  });

const createGmp = ({
  deleteByModels = testing.fn().mockResolvedValue(undefined),
  deleteByFilter = testing.fn().mockResolvedValue(undefined),
  exportByModels = testing.fn().mockResolvedValue({data: 'tags-data'}),
  exportByFilter = testing.fn().mockResolvedValue({data: 'tags-data'}),
  getTags = testing.fn().mockResolvedValue({
    data: [createTag()],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts({
        first: 1,
        all: 1,
        filtered: 1,
        length: 1,
        rows: 10,
      }),
    },
  }),
} = {}) => ({
  tag: {
    create: testing.fn().mockResolvedValue({id: 'created-id'}),
    save: testing.fn().mockResolvedValue({id: 'saved-id'}),
    clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({foo: 'bar'}),
    enable: testing.fn().mockResolvedValue(undefined),
    disable: testing.fn().mockResolvedValue(undefined),
    get: testing.fn().mockResolvedValue({data: createTag()}),
    resourcenames: {
      getAll: testing.fn().mockResolvedValue({data: []}),
    },
  },
  tags: {
    get: getTags,
    getAll: testing.fn().mockResolvedValue({data: []}),
    delete: deleteByModels,
    deleteByFilter,
    export: exportByModels,
    exportByFilter,
  },
  filters: {
    get: getFilters,
  },
  resourcenames: {
    getAll: testing.fn().mockResolvedValue({data: []}),
  },
  settings: {manualUrl: 'test/', token: 'token'},
  user: {currentSettings, getSetting},
});

const setupStore = (store: ReturnType<typeof rendererWith>['store']) => {
  store.dispatch(setUsername('admin'));
  store.dispatch(
    loadingActions.success({
      rowsperpage: {value: '10'},
      listexportfilename: {value: 'tags-%T-%D.xml'},
    }),
  );
  store.dispatch(
    defaultFilterLoadingActions.success('tags', Filter.fromString('foo=bar')),
  );
};

describe('TagsListPage tests', () => {
  test('should render full TagsListPage and create tag dialog', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);

    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Toolbar
    screen.getByTitle('Help: Tags');
    screen.getByTitle('New Tag');

    // Table headers
    screen.getByText('Name');
    screen.getByText('Value');
    screen.getByText('Active');
    screen.getByText('Resource Type');

    // Row contents
    screen.getByText('test tag');
    screen.getByText('test value');
    screen.getByText('Target');

    // Row actions
    screen.getByTitle('Clone Tag');
    screen.getByTitle('Export Tag');
    screen.getByTitle('Edit Tag');

    // Test create tag dialog
    fireEvent.click(screen.getByTitle('New Tag'));
    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should not render page if no tags are received', async () => {
    const gmp = createGmp({
      getTags: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts({
            first: 0,
            all: 0,
            filtered: 0,
            length: 0,
            rows: 10,
          }),
        },
      }),
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);

    render(<TagsListPage />);

    await screen.findByText('No tags available');
  });

  test('should bulk delete page contents', async () => {
    const deleteByModels = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({deleteByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    const trashIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(trashIcon);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    fireEvent.click(screen.getByText('Move to Trashcan'));

    await wait();
    expect(deleteByModels).toHaveBeenCalled();
  });

  test('should bulk delete selected tags', async () => {
    const deleteByModels = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({deleteByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Switch selection type to "Apply to selection"
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // Select the tag row checkbox
    const tableBody = within(screen.getTableBody());
    const checkboxes = tableBody.getAllCheckBoxes();
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    const trashIcon = screen.getByTitle('Move selection to trashcan');
    fireEvent.click(trashIcon);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    fireEvent.click(screen.getByText('Move to Trashcan'));

    await wait();
    expect(deleteByModels).toHaveBeenCalled();
  });

  test('should bulk delete all filtered tags', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({deleteByFilter});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Switch selection type to "Apply to all filtered"
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    const trashIcon = screen.getByTitle('Move all filtered to trashcan');
    fireEvent.click(trashIcon);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    fireEvent.click(screen.getByText('Move to Trashcan'));

    await wait();
    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should bulk export page contents', async () => {
    const exportByModels = testing.fn().mockResolvedValue({data: 'tags-data'});
    const gmp = createGmp({exportByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);

    await wait();
    expect(exportByModels).toHaveBeenCalled();
  });

  test('should bulk export selected tags', async () => {
    const exportByModels = testing.fn().mockResolvedValue({data: 'tags-data'});
    const gmp = createGmp({exportByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Switch selection type to "Apply to selection"
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // Select the tag row checkbox
    const tableBody = within(screen.getTableBody());
    const checkboxes = tableBody.getAllCheckBoxes();
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);

    await wait();
    expect(exportByModels).toHaveBeenCalled();
  });

  test('should bulk export all filtered tags', async () => {
    const exportByFilter = testing
      .fn()
      .mockResolvedValue({data: 'tags-filtered-data'});
    const gmp = createGmp({exportByFilter});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Switch selection type to "Apply to all filtered"
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);

    await wait();
    expect(exportByFilter).toHaveBeenCalled();
  });

  test('should show error notification when bulk delete fails', async () => {
    const deleteByModels = testing
      .fn()
      .mockRejectedValue(new Error('delete failed'));
    const gmp = createGmp({deleteByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    const trashIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(trashIcon);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();

    const confirmButton = screen.getByText('Move to Trashcan');
    fireEvent.click(confirmButton);

    await wait();
    expect(deleteByModels).toHaveBeenCalled();
  });

  test('should show error notification when bulk export fails', async () => {
    const exportByModels = testing
      .fn()
      .mockRejectedValue(new Error('export failed'));
    const gmp = createGmp({exportByModels});

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);

    await wait();
    expect(exportByModels).toHaveBeenCalled();
  });

  test('should open and close the BulkTags dialog', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    // Open BulkTags dialog via the tags icon in the footer
    const tagsIcon = screen.getByTitle('Add tag to page contents');
    fireEvent.click(tagsIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Close the dialog using the Cancel button in the footer
    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    fireEvent.click(cancelButton);

    await wait();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should delete an individual tag', async () => {
    const tagDelete = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp();
    gmp.tag.delete = tagDelete;

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStore(store);
    render(<TagsListPage />);

    await screen.findByText('test tag');

    const deleteIcon = screen.getByTitle('Move Tag to trashcan');
    fireEvent.click(deleteIcon);

    await wait();
    expect(tagDelete).toHaveBeenCalled();
  });
});
