/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {TICKET_STATUS} from 'gmp/models/ticket';
import User from 'gmp/models/user';
import EditTicketDialog from 'web/pages/tickets/EditDialog';
import {
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

describe('EditTicketDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should display notes', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        closedNote="Ticket has been closed"
        fixedNote="Ticket has been fixed"
        openNote="Ticket has been opened"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getByName('openNote')).toHaveTextContent(
      'Ticket has been opened',
    );
    expect(screen.getByName('closedNote')).toHaveTextContent(
      'Ticket has been closed',
    );
    expect(screen.getByName('fixedNote')).toHaveTextContent(
      'Ticket has been fixed',
    );
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        closedNote="Ticket has been closed"
        fixedNote="Ticket has been fixed"
        openNote="Ticket has been opened"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      status: TICKET_STATUS.open,
      ticketId: 't1',
      userId: 'u1',
      openNote: 'Ticket has been opened',
      closedNote: 'Ticket has been closed',
      fixedNote: 'Ticket has been fixed',
    });
  });

  test('should allow to change status', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        fixedNote="Ticket has been fixed"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const selectItems = await getSelectItemElementsForSelect(selects[0]);
    expect(selectItems.length).toEqual(3);
    fireEvent.click(selectItems[1]);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      status: TICKET_STATUS.fixed,
      ticketId: 't1',
      userId: 'u1',
      openNote: '',
      closedNote: '',
      fixedNote: 'Ticket has been fixed',
    });
  });

  test('should allow to change user', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        openNote="Ticket has been opened"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const selectItems = await getSelectItemElementsForSelect(selects[1]);
    expect(selectItems.length).toEqual(2);
    fireEvent.click(selectItems[1]);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      status: TICKET_STATUS.open,
      ticketId: 't1',
      userId: 'u2',
      openNote: 'Ticket has been opened',
      closedNote: '',
      fixedNote: '',
    });
  });

  test('should not save invalid form states and render error bubble', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        openNote="Ticket has been opened."
        status={TICKET_STATUS.closed}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <EditTicketDialog
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});
