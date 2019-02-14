/* Copyright (C) 2019 Greenbone Networks GmbH
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
import React from 'react';

import {render, fireEvent, queryAllByTestId} from 'web/utils/testing';

import CreateTicketDialog from '../createdialog';
import User from 'gmp/models/user';

const u1 = new User({
  _id: 'u1',
  name: 'foo',
});
const u2 = new User({
  _id: 'u2',
  name: 'bar',
});

const users = [u1, u2];

describe('CreateTicketDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleUserIdChange = jest.fn();

    const {baseElement} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should allow to select user', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleUserIdChange = jest.fn();

    const {getByTestId, baseElement} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const selectButton = getByTestId('select-open-button');
    fireEvent.click(selectButton);

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(2);

    fireEvent.click(selectElements[1]);

    expect(handleUserIdChange).toHaveBeenCalledWith('u2', 'userId');
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleUserIdChange = jest.fn();

    const {getByTestId} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleUserIdChange = jest.fn();

    const {getByTestId, baseElement} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const noteInput = baseElement.querySelector('textarea');
    fireEvent.change(noteInput, {target: {value: 'foobar'}});

    const saveButton = getByTestId('dialog-save-button');

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      resultId: 'r1',
      userId: 'u1',
      note: 'foobar',
    });
  });
});
