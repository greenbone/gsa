/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import Ticket, {TICKET_STATUS} from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import {useGetTicket, useGetTickets} from 'web/hooks/use-query/tickets';

const ticket = Ticket.fromElement({
  _id: 'ticket-1',
  name: 'Test Ticket',
  status: TICKET_STATUS.open,
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
});

const ticket2 = Ticket.fromElement({
  _id: 'ticket-2',
  name: 'Test Ticket 2',
  status: TICKET_STATUS.fixed,
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  fixed_time: '2024-01-12T09:00:00Z',
  fixed_note: 'Ticket fixed',
});

const filter = QueryFilter.fromString('name~test');

const SingleTicketComponent = ({id}: {id: string}) => {
  const {data, isLoading, isError} = useGetTicket({id});

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="ticket">
      <span data-testid="ticket-name">{data.name}</span>
      <span data-testid="ticket-id">{data.id}</span>
    </div>
  );
};

const TicketListComponent = ({filter}: {filter?: FilterType}) => {
  const {data, isLoading, isError} = useGetTickets({filter});

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="tickets">
      {data.entities.map(t => (
        <div key={t.id} data-testid="ticket-item">
          {t.name}
        </div>
      ))}
    </div>
  );
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  ticket: {
    get: testing.fn().mockResolvedValue({data: ticket}),
  },
  tickets: {
    get: testing.fn().mockResolvedValue({
      data: [ticket, ticket2],
      meta: {
        filter,
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
});

describe('useGetTicket', () => {
  test('should fetch a single ticket', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SingleTicketComponent id="ticket-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-name')).toHaveTextContent(
        'Test Ticket',
      );
    });

    expect(gmp.ticket.get).toHaveBeenCalledWith({id: 'ticket-1'});
    expect(screen.getByTestId('ticket-id')).toHaveTextContent('ticket-1');
  });

  test('should show loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SingleTicketComponent id="ticket-1" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('useGetTickets', () => {
  test('should fetch a list of tickets', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<TicketListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('ticket-item')).toHaveLength(2);
    });

    expect(gmp.tickets.get).toHaveBeenCalled();
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
  });
});
