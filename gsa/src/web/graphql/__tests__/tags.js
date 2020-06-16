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
import {
  createTagInput,
  modifyTagInput,
  createCreateTagMock,
  createModifyTagMock,
} from '../__mocks__/tags';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {useCreateTag, useModifyTag} from '../tags';

const TestComponent = () => {
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
    const [queryMock, resultFunc] = createCreateTagMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');
    fireEvent.click(buttons[0]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag created with id 12345.',
    );
  });

  test('should modify a tag', async () => {
    const [queryMock, resultFunc] = createModifyTagMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    const {element} = render(<TestComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Tag modified.',
    );
  });
});
