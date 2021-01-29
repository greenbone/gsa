/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React, {useState} from 'react';

import Tag from 'gmp/models/tag';
import Task from 'gmp/models/task';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  createTagInput,
  modifyTagInput,
  createTagQueryMock,
  modifyTagQueryMock,
  createToggleTagQueryMock,
  createRemoveTagMock,
  createBulkTagMock,
} from '../__mocks__/tags';

import {
  useCreateTag,
  useModifyTag,
  useToggleTag,
  useRemoveTag,
  useBulkTag,
} from '../tags';

const tag = Tag.fromObject({id: '12345'});
const task = Task.fromObject({id: '23456'});

const CreateModifyTagComponent = () => {
  const [notification, setNotification] = useState('');

  const [createTag] = useCreateTag();
  const [modifyTag] = useModifyTag();

  const handleCreateResult = id => {
    setNotification(`Tag created with id ${id}.`);
  };

  const handleModifyResult = () => {
    setNotification(`Tag modified.`);
  };

  return (
    <div>
      <Button
        title={'Create tag'}
        onClick={() => createTag(createTagInput).then(handleCreateResult)}
      />
      <Button
        title={'Modify tag'}
        onClick={() => modifyTag(modifyTagInput).then(handleModifyResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Tag mutation tests', () => {
  test('should create a tag', async () => {
    const [queryMock, resultFunc] = createTagQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<CreateModifyTagComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag created with id 12345.',
    );
  });

  test('should modify a tag', async () => {
    const [queryMock, resultFunc] = modifyTagQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<CreateModifyTagComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag modified.',
    );
  });
});

const ToggleTagComponent = () => {
  const [notification, setNotification] = useState('');

  const [toggleTag] = useToggleTag();

  const handleEnableResult = () => {
    setNotification('Tag enabled.');
  };

  const handleDisableResult = () => {
    setNotification(`Tag disabled.`);
  };

  return (
    <div>
      <Button
        title={'Enable tag'}
        onClick={() => toggleTag(tag, true).then(handleEnableResult)}
      />
      <Button
        title={'Disable tag'}
        onClick={() => toggleTag(tag, false).then(handleDisableResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Tag toggle tests', () => {
  test('should enable a tag', async () => {
    const [queryMock, resultFunc] = createToggleTagQueryMock(tag, true);

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<ToggleTagComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag enabled.',
    );
  });

  test('should disable a tag', async () => {
    const [queryMock, resultFunc] = createToggleTagQueryMock(tag, false);

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<ToggleTagComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag disabled.',
    );
  });
});

const RemoveTagComponent = () => {
  const [notification, setNotification] = useState('');

  const [removeTag] = useRemoveTag();

  const handleRemoveResult = () => {
    setNotification('Tag removed.');
  };

  return (
    <div>
      <Button
        title={'Remove tag'}
        onClick={() => removeTag(tag.id, task).then(handleRemoveResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Tag remove tests', () => {
  test('should enable a tag', async () => {
    const [queryMock, resultFunc] = createRemoveTagMock(tag, task);

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<RemoveTagComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag removed.',
    );
  });
});

const BulkTagTestComponent = () => {
  const [notification, setNotification] = useState('');

  const [bulkTag] = useBulkTag();

  const handleBulkTag = () => {
    setNotification('Tag added.');
  };
  return (
    <div>
      <Button
        title={'Bulk tag'}
        onClick={() =>
          bulkTag(tag.id, {
            resourceType: 'TASK',
            resourceIds: ['foo', 'bar'],
            resourceFilter: 'lorem',
          }).then(handleBulkTag)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Bulk tag tests', () => {
  test('should bulk tag', async () => {
    const [queryMock, resultFunc] = createBulkTagMock('12345', {
      resourceType: 'TASK',
      resourceIds: ['foo', 'bar'],
      resourceFilter: 'lorem',
    });
    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<BulkTagTestComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent('Tag added.');
  });
});
