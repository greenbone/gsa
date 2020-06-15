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

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {CREATE_TAG, MODIFY_TAG, useCreateTag, useModifyTag} from '../tags';

const createTagInput = {
  name: 'foo',
  resourceType: 'OPERATING_SYSTEM',
};

const modifyTagInput = {
  id: '12345',
};

const createTagResult = jest.fn().mockReturnValue({
  data: {
    createTag: {
      id: '12345',
      status: 200,
    },
  },
});

const modifyTagResult = jest.fn().mockReturnValue({
  data: {
    modifyTag: {
      ok: true,
    },
  },
});

const createTagMock = {
  request: {
    query: CREATE_TAG,
    variables: {input: createTagInput},
  },
  newData: createTagResult,
};

const modifyTagMock = {
  request: {
    query: MODIFY_TAG,
    variables: {input: modifyTagInput},
  },
  newData: modifyTagResult,
};

const TestComponent = () => {
  const [notification, setNotification] = useState('');

  const [createTag] = useCreateTag();
  const [modifyTag] = useModifyTag();

  const handleCreateResult = resp => {
    const {data} = resp;
    setNotification(
      `Tag created with id ${data.createTag.id} and status ${data.createTag.status}.`,
    );
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification(`Tag modified with ok=${data.modifyTag.ok}.`);
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
    const {render} = rendererWith({queryMocks: [createTagMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createTagResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag created with id 12345 and status 200.',
    );
  });

  test('should modify a tag', async () => {
    const {render} = rendererWith({queryMocks: [modifyTagMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(modifyTagResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag modified with ok=true.',
    );
  });
});
