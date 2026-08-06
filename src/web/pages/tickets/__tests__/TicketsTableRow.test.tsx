/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import Ticket, {type TicketElement} from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import TicketsTableRow from 'web/pages/tickets/TicketsTableRow';

const ticket = Ticket.fromElement({
  _id: 'tk1',
  name: 'Test Vulnerability',
  status: 'Open' as TicketElement['status'],
  severity: 8.5,
  host: '192.168.1.100',
  solution_type: 'VendorFix',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
  permissions: {permission: [{name: 'everything'}]},
  task: {_id: 't1', name: 'Test Task'},
  report: {_id: 'r1', timestamp: '2024-01-15T10:00:00Z'},
  result: {_id: 'res1'},
});

const orphanTicket = Ticket.fromElement({
  _id: 'tk2',
  name: 'Orphan Vulnerability',
  status: 'Fixed' as TicketElement['status'],
  severity: 5.0,
  host: '10.0.0.1',
  solution_type: 'Workaround',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  orphan: 1,
});

const createGmp = () => ({
  settings: {severityRating: 'CVSSv3'},
  session: createSession({username: 'admin'}),
});

describe('TicketsTableRow', () => {
  test('should render row data', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <TicketsTableRow
        entity={ticket}
        links={false}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByText('Test Vulnerability');
    screen.getByText('192.168.1.100');
    screen.getByText('admin');
    screen.getByText('Open');
  });

  test('should render action buttons', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <TicketsTableRow
        entity={ticket}
        onTicketCloneClick={testing.fn()}
        onTicketDeleteClick={testing.fn()}
        onTicketEditClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByTitle('Delete Ticket');
    screen.getByTitle('Edit Ticket');
    screen.getByTitle('Clone Ticket');
  });

  test('should call action handlers', () => {
    const handleEdit = testing.fn();
    const handleClone = testing.fn();
    const handleDelete = testing.fn();

    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <TicketsTableRow
        entity={ticket}
        onTicketCloneClick={handleClone}
        onTicketDeleteClick={handleDelete}
        onTicketEditClick={handleEdit}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    fireEvent.click(screen.getByTitle('Edit Ticket'));
    expect(handleEdit).toHaveBeenCalledWith(ticket);

    fireEvent.click(screen.getByTitle('Clone Ticket'));
    expect(handleClone).toHaveBeenCalledWith(ticket);

    fireEvent.click(screen.getByTitle('Delete Ticket'));
    expect(handleDelete).toHaveBeenCalledWith(ticket);
  });

  test('should render NA severity for orphan tickets', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <TicketsTableRow
        entity={orphanTicket}
        links={false}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByText('Orphan Vulnerability');
    screen.getByText('N/A');
    screen.getByText('Fixed');
  });
});
