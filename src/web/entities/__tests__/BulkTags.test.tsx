/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import date from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';
import BulkTags from 'web/entities/BulkTags';
import {setSessionTimeout} from 'web/store/usersettings/actions';
import SelectionType from 'web/utils/SelectionType';

describe('BulkTags tests', () => {
  test('should render the BulkTags component', () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [new Tag({id: '1'})]});
    const gmp = {
      tags: {getAll: getAllTags},
    };
    const timeout = date('2019-10-10');

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(setSessionTimeout(timeout));

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
  });

  test('should allow to tag all filtered entities', () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [new Tag({id: '1'})]});
    const gmp = {
      tags: {getAll: getAllTags},
    };
    const timeout = date('2019-10-10');

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(setSessionTimeout(timeout));

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

  test('should allow to tag tasks with a new tag', async () => {
    const entities = [new Task({id: '1'}), new Task({id: '2'})];
    const entitiesCounts = new CollectionCounts({filtered: 2, all: 2});
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const createTag = testing.fn().mockResolvedValue({data: {id: '2'}});
    const getTag = testing.fn().mockResolvedValue({data: new Tag({id: '2'})});
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [new Tag({id: '1'})]});
    const getAllResourceNames = testing.fn().mockResolvedValue({data: []});
    const saveTag = testing.fn().mockResolvedValue({data: {id: '2'}});
    const gmp = {
      tags: {getAll: getAllTags},
      resourcenames: {getAll: getAllResourceNames},
      tag: {
        create: createTag,
        get: getTag,
        save: saveTag,
      },
    };
    const timeout = date('2019-10-10');

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(setSessionTimeout(timeout));

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
      resourceIds: [],
      resourceType: 'task',
      value: '',
    });
    expect(getTag).toHaveBeenCalledWith({id: '2'});

    const saveTagsButton = tagsDialog.getDialogSaveButton();
    fireEvent.click(saveTagsButton);

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
    });
  });
});
