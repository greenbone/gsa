/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import date from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import BulkTags from 'web/entities/BulkTags';
import {setSessionTimeout} from 'web/store/usersettings/actions';
import SelectionType from 'web/utils/SelectionType';
import {
  screen,
  rendererWith,
  getByTestId,
  fireEvent,
  getAllByTitle,
  wait,
  getByRole,
} from 'web/utils/Testing';


const getDialog = () => {
  return screen.getByRole('dialog');
};

const getDialogTitle = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByRole(dialog, 'heading');
};

const getDialogSaveButton = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-save-button');
};

describe('BulkTags', () => {
  test('should render the BulkTags component', () => {
    const entities = [Task.fromElement({id: 1}), Task.fromElement({id: 2})];
    const entitiesCounts = {filtered: 2, all: 2};
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [Tag.fromElement({id: 1})]});
    const gmp = {
      user: {
        renewSession: testing.fn().mockResolvedValue({data: 123}),
      },
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
    const dialog = getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should allow to tag all filtered entities', () => {
    const entities = [Task.fromElement({id: 1}), Task.fromElement({id: 2})];
    const entitiesCounts = {filtered: 2, all: 2};
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [Tag.fromElement({id: 1})]});
    const gmp = {
      user: {
        renewSession: testing.fn().mockResolvedValue({data: 123}),
      },
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
    const title = getDialogTitle();
    expect(title).toHaveTextContent('Add Tag to All Filtered');
  });

  test('should allow to tag tasks with a new tag', async () => {
    const entities = [Task.fromElement({id: '1'}), Task.fromElement({id: '2'})];
    const entitiesCounts = {filtered: 2, all: 2};
    const filter = Filter.fromString('');
    const selectedEntities = [];
    const onClose = testing.fn();
    const createTag = testing.fn().mockResolvedValue({data: {id: '2'}});
    const getTag = testing
      .fn()
      .mockResolvedValue({data: Tag.fromElement({id: '2'})});
    const getAllTags = testing
      .fn()
      .mockResolvedValue({data: [Tag.fromElement({id: '1'})]});
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
      user: {
        renewSession: testing.fn().mockResolvedValue({data: 123}),
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

    const dialog = getDialog();
    const newTag = getAllByTitle(dialog, 'Create a new Tag')[0];

    fireEvent.click(newTag);
    expect(getAllResourceNames).toHaveBeenCalledWith({
      resource_type: 'task',
    });

    expect(screen.queryAllByRole('dialog', {hidden: true})).toHaveLength(2);
    const dialogs = screen.getAllByRole('dialog');

    const tagsDialog = dialog[0];
    const tagDialog = dialogs[1];
    const saveTagButton = getDialogSaveButton(tagDialog);

    fireEvent.click(saveTagButton);

    await wait();

    expect(createTag).toHaveBeenCalledWith({
      active: 1,
      comment: '',
      name: 'default:unnamed',
      resource_ids: [],
      resource_type: 'task',
      resources: [],
      value: '',
    });
    expect(getTag).toHaveBeenCalledWith({id: '2'});

    const saveTagsButton = getDialogSaveButton(tagsDialog);

    fireEvent.click(saveTagsButton);

    expect(saveTag).toHaveBeenCalledWith({
      active: 1,
      comment: '',
      filter: null,
      id: '2',
      name: undefined,
      resource_ids: ['1', '2'],
      resource_type: 'task',
      resources_action: 'add',
      value: '',
    });
  });
});
