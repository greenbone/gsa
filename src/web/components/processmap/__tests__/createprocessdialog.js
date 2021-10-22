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
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import CreateProcessDialog from '../createprocessdialog';

describe('CreateProcessDialog tests', () => {
  test('should render dialog for creating a process', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByName, getByTestId, getAllByTestId} = render(
      <CreateProcessDialog
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const titleBar = getByTestId('dialog-title-bar');
    const cancelButton = getByTestId('dialog-close-button');
    const saveButton = getByTestId('dialog-save-button');
    const formGroups = getAllByTestId('formgroup-title');

    const nameInput = getByName('name');
    const commentInput = getByName('comment');

    expect(titleBar).toHaveTextContent('Create Process');

    expect(formGroups[0]).toHaveTextContent('Name');
    expect(nameInput).toHaveAttribute('value', 'Unnamed');

    expect(formGroups[1]).toHaveTextContent('Comment');
    expect(commentInput).toHaveAttribute('value', '');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Create');
  });

  test('should render dialog for editing a process', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByName, getByTestId, getAllByTestId} = render(
      <CreateProcessDialog
        comment={'bar'}
        id={'123'}
        name={'foo'}
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const titleBar = getByTestId('dialog-title-bar');
    const cancelButton = getByTestId('dialog-close-button');
    const saveButton = getByTestId('dialog-save-button');
    const formGroups = getAllByTestId('formgroup-title');

    const nameInput = getByName('name');
    const commentInput = getByName('comment');

    expect(titleBar).toHaveTextContent('Edit Process');

    expect(formGroups[0]).toHaveTextContent('Name');
    expect(nameInput).toHaveAttribute('value', 'foo');

    expect(formGroups[1]).toHaveTextContent('Comment');
    expect(commentInput).toHaveAttribute('value', 'bar');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Save');
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByTestId} = render(
      <CreateProcessDialog
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const closeButton = getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleEdit).not.toHaveBeenCalled();
    expect(handleCreate).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the dialog', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByTestId} = render(
      <CreateProcessDialog
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const cancelButton = getByTestId('dialog-close-button');

    fireEvent.click(cancelButton);

    expect(handleEdit).not.toHaveBeenCalled();
    expect(handleCreate).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to create a process', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByName, getByTestId} = render(
      <CreateProcessDialog
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'foo'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'bar'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleEdit).not.toHaveBeenCalled();
    expect(handleCreate).toHaveBeenCalledWith({
      comment: 'bar',
      id: undefined,
      name: 'foo',
    });
  });

  test('should allow to edit a process', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByName, getByTestId} = render(
      <CreateProcessDialog
        comment={'bar'}
        id={'123'}
        name={'foo'}
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'lorem'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'ipsum'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleCreate).not.toHaveBeenCalled();
    expect(handleEdit).toHaveBeenCalledWith({
      comment: 'ipsum',
      id: '123',
      name: 'lorem',
    });
  });

  test('should not save invalid form states', () => {
    const handleClose = jest.fn();
    const handleCreate = jest.fn();
    const handleEdit = jest.fn();

    const {getByTestId} = render(
      <CreateProcessDialog
        name="invalidChar\ "
        onClose={handleClose}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    const nameField = getByTestId('create-process-dialog-name');
    fireEvent.change(nameField, {target: {value: '\\ invalid char'}});

    fireEvent.click(saveButton);

    expect(handleCreate).not.toHaveBeenCalled();
  });
});
