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
import {useGetTickets} from 'web/hooks/use-query/tickets';

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

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
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

describe('useGetTickets', () => {
  test('should fetch a list of tickets', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<TicketListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('ticket-item')).toHaveLength(2);
    });

    expect(gmp.tickets.get).toHaveBeenCalledWith({filter});
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
  });

  test('should not fetch tickets without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<TicketListComponent filter={filter} />);

    expect(gmp.tickets.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching tickets fails', async () => {
    const gmp = createGmp();
    gmp.tickets.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});

    render(<TicketListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});
