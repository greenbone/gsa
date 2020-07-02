/* Copyright (C) 2020 Greenbone Networks GmbH
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

import React from 'react';

import date from 'gmp/models/date';

import CollectionCounts from 'gmp/collection/collectioncounts';
import Task from 'gmp/models/task';
import Filter from 'gmp/models/filter';
import Tag from 'gmp/models/tag';

import {
  rendererWith,
  queryAllByTestId,
  fireEvent,
  wait,
} from 'web/utils/testing';

import {BulkTagComponent} from '../bulkactions';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

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

const handleClose = jest.fn();
const gmp = {
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
