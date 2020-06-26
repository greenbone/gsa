/* Copyright (C) 2020 Greenbone Networks GmbH
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
  createEnableTagMock,
  createDisableTagMock,
  createRemoveTagMock,
  createBulkTagMock,
  createImperativeGetTagsQueryMock,
  createImperativeGetTagQueryMock,
} from '../__mocks__/tags';

import {
  useCreateTag,
  useModifyTag,
  useToggleTag,
  useRemoveTag,
  useBulkTag,
  useImperativeGetTags,
  useImperativeGetTag,
} from '../tags';
import {isDefined} from 'gmp/utils/identity';

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
    const [queryMock, resultFunc] = createTagQueryMock;

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
    const [queryMock, resultFunc] = modifyTagQueryMock;

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
    const [queryMock, resultFunc] = createEnableTagMock(tag);

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
    const [queryMock, resultFunc] = createDisableTagMock(tag);

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

const ImperativeGetTagsComponent = () => {
  const [getTags] = useImperativeGetTags();
  const [tags, setTags] = useState();

  const handleGetTags = () => {
    return getTags('foo=bar').then(resp => {
      const returned = resp?.data?.tags?.edges;
      const fetchedTags = returned.map(entity => Tag.fromObject(entity.node));
      setTags(fetchedTags);
    });
  };
  return (
    <div>
      <button data-testid="load" onClick={handleGetTags} />
      {isDefined(tags) ? (
        tags.map(tag => {
          return (
            <div key={tag.id} data-testid="tag">
              {tag.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-tag" />
      )}
    </div>
  );
};

describe('useImperativeGetTags tests', () => {
  test('should query tags', async () => {
    const [mock, resultFunc] = createImperativeGetTagsQueryMock('foo=bar');

    const {render} = rendererWith({queryMocks: [mock]});
    render(<ImperativeGetTagsComponent />);

    let noTags = screen.queryByTestId('no-tag');
    expect(noTags).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();
    expect(resultFunc).toHaveBeenCalled();
    const tags = screen.getAllByTestId('tag');

    expect(tags).toHaveLength(1);
    expect(tags[0]).toHaveTextContent('foo');
    expect(noTags).not.toBeInTheDocument();
  });
});

const ImperativeGetTagComponent = () => {
  const [getTag] = useImperativeGetTag();
  const [tag, setTag] = useState();

  const handleGetTag = () => {
    return getTag('123').then(resp => {
      const newTag = Tag.fromObject(resp.data.tag);
      setTag(newTag);
    });
  };
  return (
    <div>
      <button data-testid="load" onClick={handleGetTag} />
      {isDefined(tag) ? (
        <div data-testid="tag">
          <span data-testid="id">{tag.id}</span>
          <span data-testid="name">{tag.name}</span>
          <span data-testid="comment">{tag.comment}</span>
          <span data-testid="value">{tag.value}</span>
        </div>
      ) : (
        <div data-testid="no-tag" />
      )}
    </div>
  );
};

describe('useImperativeGetTag tests', () => {
  test('should query tag', async () => {
    const [mock, resultFunc] = createImperativeGetTagQueryMock();

    const {render} = rendererWith({queryMocks: [mock]});
    render(<ImperativeGetTagComponent />);

    let noTag = screen.queryByTestId('no-tag');
    expect(noTag).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    await wait();
    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('tag')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('123');
    expect(screen.getByTestId('name')).toHaveTextContent('foo');
    expect(screen.getByTestId('comment')).toHaveTextContent('bar');
    expect(screen.getByTestId('value')).toHaveTextContent('baz');
  });
});
