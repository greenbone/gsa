/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, queryAllByTestId} from 'web/utils/testing';

import {TICKET_STATUS} from 'gmp/models/ticket';
import User from 'gmp/models/user';

import EditTicketDialog from '../editdialog';

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

    const {baseElement} = render(
      <EditTicketDialog
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should display notes', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement} = render(
      <EditTicketDialog
        openNote="Ticket has been opened"
        fixedNote="Ticket has been fixed"
        closedNote="Ticket has been closed"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement.querySelector('[name=openNote]')).toHaveTextContent(
      'Ticket has been opened',
    );
    expect(baseElement.querySelector('[name=closedNote]')).toHaveTextContent(
      'Ticket has been closed',
    );
    expect(baseElement.querySelector('[name=fixedNote]')).toHaveTextContent(
      'Ticket has been fixed',
    );
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByTestId} = render(
      <EditTicketDialog
        openNote="Ticket has been opened"
        fixedNote="Ticket has been fixed"
        closedNote="Ticket has been closed"
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');

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

  test('should allow to change status', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement, getByTestId} = render(
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

    const selectButtons = queryAllByTestId(baseElement, 'select-open-button');
    fireEvent.click(selectButtons[0]);

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(3);

    fireEvent.click(selectElements[1]);

    const saveButton = getByTestId('dialog-save-button');

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

  test('should allow to change user', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement, getByTestId} = render(
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

    const selectButtons = queryAllByTestId(baseElement, 'select-open-button');
    fireEvent.click(selectButtons[1]);

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(2);

    fireEvent.click(selectElements[1]);

    const saveButton = getByTestId('dialog-save-button');

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

    const {getByTestId} = render(
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
    const saveButton = getByTestId('dialog-save-button');

    fireEvent.click(saveButton);

    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    // eslint-disable-next-line no-shadow
    const {getByTestId} = render(
      <EditTicketDialog
        status={TICKET_STATUS.open}
        ticketId="t1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
