/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable react/prop-types */

import React, {useState} from 'react';

import date from 'gmp/models/date';

import CollectionCounts from 'gmp/collection/collectioncounts';
import Task from 'gmp/models/task';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {
  rendererWith,
  queryAllByTestId,
  fireEvent,
  wait,
  screen,
} from 'web/utils/testing';

import {
  BulkTagComponent,
  useBulkExportEntities,
  useBulkDeleteEntities,
} from '../bulkactions';

afterEach(() => {
  // if not, then the call count of each function will persist between tests
  jest.clearAllMocks();
});

const task1 = Task.fromObject({id: 'foo'});
const task2 = Task.fromObject({id: 'bar'});
const task3 = Task.fromObject({id: 'lorem'});
const entities = [task1, task2];
const selected = [task1, task3];
const filter = Filter.fromString('ipsum');

const tag1 = Tag.fromObject({id: '12345', name: 'cat', value: 'meow'});
const tag2 = Tag.fromObject({id: '23456', name: 'dog'});
const tag3 = Tag.fromObject({id: '34567', name: 'goat'});
const counts = new CollectionCounts({
  first: 1,
  all: 2,
  filtered: 2,
  length: 2,
  rows: 2,
});

const dummyEntities = [{id: 'foo'}, {id: 'bar'}];
const selectedEntities = [{id: 'foo'}, {id: 'bar'}, {id: 'lorem'}];
const deleteResponse = {
  data: {
    ok: true,
  },
};

let deleteByFilterFunc;
let deleteByIdsFunc;
let exportByFilterFunc;
let exportByIdsFunc;
let gmp;
let handleClose;
let onDeleted;
let onDownload;
let onError;

beforeEach(() => {
  handleClose = jest.fn();
  onDownload = jest.fn();
  onError = jest.fn();
  onDeleted = jest.fn();

  gmp = {
    tags: {
      getAll: jest.fn().mockResolvedValue({data: [tag1, tag2]}),
    },
    tag: {
      get: jest.fn().mockResolvedValue({data: tag3}),
      create: jest.fn().mockResolvedValue({data: {id: '34567', name: 'goat'}}),
    },
    tasks: {
      getAll: jest.fn().mockResolvedValue({data: [task1, task2, task3]}),
    },
    settings: {
      enableHyperionOnly: true,
    },
  };

  deleteByIdsFunc = jest.fn().mockResolvedValue(deleteResponse);
  deleteByFilterFunc = jest.fn().mockResolvedValue(deleteResponse);

  exportByFilterFunc = jest.fn().mockResolvedValue({
    data: {
      exportIpsumByFilter: {
        exportedEntities: '<get_entities_response />',
      },
    },
  });
  exportByIdsFunc = jest.fn().mockResolvedValue({
    data: {
      exportIpsumByIds: {
        exportedEntities: '<get_entities_response />',
      },
    },
  });
});

describe('BulkTagComponent tests', () => {
  test('should render', async () => {
    const {render} = rendererWith({gmp, store: true});

    const {getByTestId} = render(
      <BulkTagComponent
        entities={entities}
        selected={selected}
        filter={filter}
        selectionType="0"
        entitiesCounts={counts}
        onClose={handleClose}
      />,
    );

    await wait();

    const title = getByTestId('dialog-title-bar');

    expect(title).toHaveTextContent('Add Tag to Page Contents');
  });

  test('should render different title based on selection', async () => {
    const {render} = rendererWith({gmp, store: true});

    const {getByTestId} = render(
      <BulkTagComponent
        entities={entities}
        selected={selected}
        filter={filter}
        selectionType="2"
        entitiesCounts={counts}
        onClose={handleClose}
      />,
    );

    await wait();

    const title = getByTestId('dialog-title-bar');

    expect(title).toHaveTextContent('Add Tag to All Filtered');
  });

  test('Should render tags in select', async () => {
    const {render} = rendererWith({gmp, store: true});

    const {baseElement, getByTestId} = render(
      <BulkTagComponent
        entities={entities}
        selected={selected}
        filter={filter}
        selectionType="0"
        entitiesCounts={counts}
        onClose={handleClose}
      />,
    );

    await wait();

    fireEvent.click(getByTestId('select-open-button'));

    await wait();

    expect(gmp.tags.getAll).toHaveBeenCalled();

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(2);
    expect(selectElements[0]).toHaveTextContent('cat');
    expect(selectElements[1]).toHaveTextContent('dog');
  });

  test('should create new tag', async () => {
    const renewDate = date('2020-03-20');

    const [
      renewSessionMock,
      renewSessionResultFunc,
    ] = createRenewSessionQueryMock(renewDate);
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [renewSessionMock],
    });

    const {baseElement, getByTestId, getAllByTestId} = render(
      <BulkTagComponent
        entities={entities}
        selected={selected}
        filter={filter}
        selectionType="0"
        entitiesCounts={counts}
        onClose={handleClose}
      />,
    );

    await wait();

    fireEvent.click(getByTestId('select-open-button'));

    await wait();

    expect(gmp.tags.getAll).toHaveBeenCalled();

    const tag = getByTestId('select-selected-value');
    expect(tag).not.toHaveAttribute('title');

    const newIcon = getByTestId('svg-icon');
    expect(newIcon).toHaveAttribute('title', 'Create a new Tag');

    fireEvent.click(newIcon);

    await wait();

    expect(baseElement).toHaveTextContent('New Tag');

    const formFields = baseElement.querySelectorAll('input');

    const selectedElements = getAllByTestId('select-selected-value');
    expect(selectedElements.length).toEqual(2);
    expect(selectedElements[1]).toHaveAttribute('title', 'Task');

    fireEvent.change(formFields[0], {target: {value: 'goat'}});
    expect(formFields[0]).toHaveAttribute('value', 'goat');

    const saveButtons = getAllByTestId('dialog-save-button');
    fireEvent.click(saveButtons[1]);

    await wait();

    expect(gmp.tag.create).toHaveBeenCalled();
    expect(renewSessionResultFunc).toHaveBeenCalled();

    await wait();

    const selectedTag = getByTestId('select-selected-value');
    expect(selectedTag).toHaveAttribute('title', 'goat');
  });
});

const BulkExportEntitiesComponent = ({selectionType}) => {
  const [message, setMessage] = useState('Not called');

  const bulkExportEntities = useBulkExportEntities();

  const handleExportEntities = () => {
    return bulkExportEntities({
      entities: dummyEntities,
      selected: selectedEntities,
      filter: Filter.fromString('cat'),
      resourceType: 'ipsum',
      selectionType,
      exportByFilterFunc,
      exportByIdsFunc,
      onDownload,
      onError,
    });
  };

  return (
    <div>
      <button
        data-testid="load"
        onClick={() =>
          handleExportEntities().then(setMessage('Bulk export called!'))
        }
      />
      <span data-testid="message">{message}</span>
    </div>
  );
};

describe('useBulkExportEntities tests', () => {
  test('should call export by ids query for export by page content', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkExportEntitiesComponent selectionType="0" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(exportByIdsFunc).toHaveBeenCalled();
    expect(exportByFilterFunc).not.toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk export called!');
  });

  test('should call export by ids query for export by selection', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkExportEntitiesComponent selectionType="1" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(exportByIdsFunc).toHaveBeenCalled();
    expect(exportByFilterFunc).not.toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk export called!');
  });

  test('should call export by filter query for export by filter', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkExportEntitiesComponent selectionType="2" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(exportByFilterFunc).toHaveBeenCalled();
    expect(exportByIdsFunc).not.toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk export called!');
  });
});

const BulkDeleteEntitiesComponent = ({selectionType}) => {
  const [message, setMessage] = useState('Not called');

  const bulkDeleteEntities = useBulkDeleteEntities();

  const handleBulkDeleteEntities = () => {
    return bulkDeleteEntities({
      entities: dummyEntities,
      selected: selectedEntities,
      filter: Filter.fromString('cat'),
      resourceType: 'ipsum',
      selectionType,
      deleteByFilterFunc,
      deleteByIdsFunc,
      onDeleted,
      onError: jest.fn(),
    });
  };

  return (
    <div>
      <button
        data-testid="load"
        onClick={() =>
          handleBulkDeleteEntities().then(setMessage('Bulk delete called!'))
        }
      />
      <span data-testid="message">{message}</span>
    </div>
  );
};

describe('useBulkDeleteEntities tests', () => {
  test('should call delete by ids query for delete by page content', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkDeleteEntitiesComponent selectionType="0" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(deleteByIdsFunc).toHaveBeenCalled();
    expect(deleteByFilterFunc).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk delete called!');
  });

  test('should call delete by ids query for delete by selection', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkDeleteEntitiesComponent selectionType="1" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(deleteByIdsFunc).toHaveBeenCalled();
    expect(deleteByFilterFunc).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk delete called!');
  });

  test('should call delete by filter query for delete by filter', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(
      <BulkDeleteEntitiesComponent selectionType="2" />,
    );

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();

    expect(deleteByFilterFunc).toHaveBeenCalled();
    expect(deleteByIdsFunc).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
    expect(message).toHaveTextContent('Bulk delete called!');
  });
});
