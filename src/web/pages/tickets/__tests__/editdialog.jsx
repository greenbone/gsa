/* Copyright (C) 2019-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {TICKET_STATUS} from 'gmp/models/ticket';
import User from 'gmp/models/user';

import {
  clickElement,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
  getSelectElements,
  getSelectItemElementsForSelect,
} from 'web/components/testing';

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

    expect(getDialog()).toBeInTheDocument();
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

    render(
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

    const saveButton = getDialogSaveButton();
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

    const selects = getSelectElements();
    const selectItems = await getSelectItemElementsForSelect(selects[0]);
    expect(selectItems.length).toEqual(3);
    await clickElement(selectItems[1]);

    const saveButton = getDialogSaveButton();
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

    const selects = getSelectElements();
    const selectItems = await getSelectItemElementsForSelect(selects[1]);
    expect(selectItems.length).toEqual(2);
    await clickElement(selectItems[1]);

    const saveButton = getDialogSaveButton();
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

    const saveButton = getDialogSaveButton();
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

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});
