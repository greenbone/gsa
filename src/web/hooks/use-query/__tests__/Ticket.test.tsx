/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Ticket, {TICKET_STATUS} from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import {
  useCloneTicket,
  useCreateTicket,
  useDeleteTicket,
  useDownloadTicket,
  useGetTicket,
  useSaveTicket,
} from 'web/hooks/use-query/ticket';

const ticket = Ticket.fromElement({
  _id: 'ticket-1',
  name: 'Test Ticket',
  status: TICKET_STATUS.open,
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
});

const SingleTicketComponent = ({id}: {id: string}) => {
  const {data, isLoading, isError} = useGetTicket({id});

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (isError) return <div data-testid="error">Error</div>;
  if (!data) return <div data-testid="no-data">No data</div>;

  return (
    <div data-testid="ticket">
      <span data-testid="ticket-name">{data.name}</span>
      <span data-testid="ticket-id">{data.id}</span>
    </div>
  );
};

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  ticket: {
    get: testing.fn().mockResolvedValue({data: ticket}),
    create: testing.fn().mockResolvedValue({data: {id: 'ticket-3'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'ticket-1'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'ticket-3'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'ticket-content'}),
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

  test('should not fetch a ticket when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<SingleTicketComponent id="" />);

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.ticket.get).not.toHaveBeenCalled();
  });

  test('should not fetch a ticket without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<SingleTicketComponent id="ticket-1" />);

    expect(gmp.ticket.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching a ticket fails', async () => {
    const gmp = createGmp();
    gmp.ticket.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});

    render(<SingleTicketComponent id="ticket-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});

describe('ticket mutation hooks', () => {
  test('should create a ticket', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {resultId: 'result-1', userId: 'user-1', note: 'Note'};

    const TestComponent = () => {
      const mutation = useCreateTicket();
      return <button onClick={() => mutation.mutate(input)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(gmp.ticket.create).toHaveBeenCalledWith(input);
    });
  });

  test('should save a ticket', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {
      id: 'ticket-1',
      status: TICKET_STATUS.fixed,
      userId: 'user-1',
      fixedNote: 'Fixed',
    };

    const TestComponent = () => {
      const mutation = useSaveTicket();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(gmp.ticket.save).toHaveBeenCalledWith(input);
    });
  });

  test('should clone a ticket with its name and call onSuccess', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneTicket({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'ticket-1', name: 'Cloned Ticket'})
          }
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(gmp.ticket.clone).toHaveBeenCalledWith({
        id: 'ticket-1',
      });
      expect(onSuccess).toHaveBeenCalledWith({id: 'ticket-3'});
      expect(
        screen.getByText('Ticket Cloned Ticket cloned successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should call onError when cloning a ticket fails', async () => {
    const error = new Error('Clone failed');
    const gmp = createGmp();
    gmp.ticket.clone.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneTicket({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'ticket-1'})}>Clone</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });

  test('should delete a ticket with its name and call onSuccess', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteTicket({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'ticket-1', name: 'Deleted Ticket'})
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.ticket.delete).toHaveBeenCalledWith({
        id: 'ticket-1',
        name: 'Deleted Ticket',
      });
      expect(onSuccess).toHaveBeenCalledWith(undefined);
      expect(
        screen.getByText('Deleted Ticket deleted successfully.'),
      ).toBeInTheDocument();
    });
  });

  test('should call onError when deleting a ticket fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.ticket.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteTicket({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'ticket-1'})}>
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });

  test('should download a ticket', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDownloadTicket();
      return (
        <button onClick={() => mutation.mutate({id: 'ticket-1'})}>
          Download
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Download'}));

    await waitFor(() => {
      expect(gmp.ticket.export).toHaveBeenCalledWith({id: 'ticket-1'});
    });
  });
});
