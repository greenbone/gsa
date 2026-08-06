/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Ticket from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import TicketDetails from 'web/pages/tickets/TicketDetails';

const ticket = Ticket.fromElement({
  _id: 'tk1',
  name: 'Test Ticket',
  status: 'open',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
  task: {_id: 't1', name: 'Test Task'},
  report: {_id: 'r1', timestamp: '2024-01-15T10:00:00Z'},
  result: {_id: 'res1'},
});

const ticketWithStatuses = Ticket.fromElement({
  _id: 'tk2',
  name: 'Closed Ticket',
  status: 'closed',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
  fixed_time: '2024-01-12T09:00:00Z',
  fixed_note: 'Ticket fixed',
  fix_verified_time: '2024-01-13T10:00:00Z',
  fix_verified_report: {_id: 'r2', timestamp: '2024-01-13T10:00:00Z'},
  closed_time: '2024-01-14T11:00:00Z',
  closed_note: 'Ticket closed',
  task: {_id: 't1', name: 'Test Task'},
});

const orphanTicket = Ticket.fromElement({
  _id: 'tk3',
  name: 'Orphan Ticket',
  status: 'open',
  orphan: 1,
});

const gmp = {
  session: createSession({username: 'admin'}),
};

describe('TicketDetails', () => {
  test('should render references block', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={ticket} links={false} />);

    screen.getByText('References');
    screen.getByText('Task');
    screen.getByText('Test Task');
    screen.getByText('Report');
    screen.getByText('Result');
  });

  test('should render status details', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={ticket} links={false} />);

    screen.getByText('Status Details');
    screen.getByText('Opened');
    screen.getByText('Ticket opened');
  });

  test('should render all status timestamps when present', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={ticketWithStatuses} links={false} />);

    screen.getByText('Opened');
    screen.getByText('Ticket opened');
    screen.getByText('Fixed');
    screen.getByText('Ticket fixed');
    screen.getByText('Fix Verified');
    screen.getByText('Closed');
    screen.getByText('Ticket closed');
  });

  test('should not render references block for orphan tickets', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={orphanTicket} links={false} />);

    expect(screen.queryByText('References')).not.toBeInTheDocument();
    screen.getByText('Status Details');
  });

  test('should render links when links=true', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={ticket} links={true} />);

    const taskLink = screen.getByRole('link', {name: 'Test Task'});
    expect(taskLink).toBeInTheDocument();
  });

  test('should render text only when links=false', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<TicketDetails entity={ticket} links={false} />);

    expect(screen.queryByRole('link', {name: 'Test Task'})).toBeNull();
    screen.getByText('Test Task');
  });
});
