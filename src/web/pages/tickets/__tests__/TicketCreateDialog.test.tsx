/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import User from 'gmp/models/user';
import TicketCreateDialog from 'web/pages/tickets/TicketCreateDialog';

const u1 = User.fromElement({
  _id: 'u1',
  name: 'foo',
});
const u2 = User.fromElement({
  _id: 'u2',
  name: 'bar',
});

const users = [u1, u2];

describe('TicketCreateDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <TicketCreateDialog
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

    const {render} = rendererWith({capabilities: true});
    render(
      <TicketCreateDialog
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
    selectItems[1].click();
    expect(handleUserIdChange).toHaveBeenCalledWith('u2', 'userId');
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <TicketCreateDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    closeButton.click();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <TicketCreateDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const noteInput = screen.getByRole('textbox', {
      name: 'Note',
    });
    changeInputValue(noteInput, 'foobar');

    const saveButton = screen.getDialogSaveButton();
    saveButton.click();

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

    const {render} = rendererWith({capabilities: true});
    render(
      <TicketCreateDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    const noteInput = screen.getByRole('textbox', {
      name: 'Note',
    });
    changeInputValue(noteInput, '');

    saveButton.click();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
