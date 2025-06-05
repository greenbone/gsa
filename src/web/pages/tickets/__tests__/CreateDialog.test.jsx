/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import User from 'gmp/models/user';
import CreateTicketDialog from 'web/pages/tickets/CreateDialog';
import {
  changeInputValue,
  getSelectItemElementsForSelect,
  screen,
  render,
  fireEvent,
} from 'web/testing';

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

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should allow to select user', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const select = screen.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems.length).toEqual(2);
    fireEvent.click(selectItems[1]);
    expect(handleUserIdChange).toHaveBeenCalledWith('u2', 'userId');
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
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

    expect(baseElement).toBeVisible();
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
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

    const noteInput = baseElement.querySelector('textarea');
    changeInputValue(noteInput, 'foobar');

    const saveButton = screen.getDialogSaveButton();
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

    const saveButton = screen.getDialogSaveButton();
    const noteInput = baseElement.querySelector('textarea');
    changeInputValue(noteInput, '');

    fireEvent.click(saveButton);
    expect(handleSave).not.toHaveBeenCalled();
  });
});
