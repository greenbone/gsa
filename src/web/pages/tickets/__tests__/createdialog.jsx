/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import User from 'gmp/models/user';

import {render, fireEvent, queryAllByTestId} from 'web/utils/testing';

import CreateTicketDialog from '../createdialog';

const u1 = User.fromElement({
  _id: 'u1',
  name: 'foo',
});
const u2 = User.fromElement({
  _id: 'u2',
  name: 'bar',
});

const users = [u1, u2];

describe('CreateTicketDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

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

  test('should not save invalid form states', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

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

    const saveButton = getByTestId('dialog-save-button');
    const noteInput = baseElement.querySelector('textarea');
    fireEvent.change(noteInput, {target: {value: ''}});

    fireEvent.click(saveButton);

    expect(handleSave).not.toHaveBeenCalled();
  });
});
