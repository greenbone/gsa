/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Ticket, {TICKET_STATUS} from 'gmp/models/ticket';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TicketComponent from 'web/pages/tickets/TicketComponent';

const ticket = Ticket.fromElement({
  _id: 'tk1',
  name: 'Test Ticket',
  status: TICKET_STATUS.open,
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  open_note: 'Ticket opened',
  task: {_id: 't1', name: 'Test Task'},
  report: {_id: 'r1', timestamp: '2024-01-15T10:00:00Z'},
  result: {_id: 'res1'},
});

const user1 = User.fromElement({_id: 'u1', name: 'admin'});
const user2 = User.fromElement({_id: 'u2', name: 'user2'});

const createGmp = () => ({
  settings: {
    reloadInterval: 60000,
    reloadIntervalActive: 30000,
    reloadIntervalInactive: 300000,
  },
  ticket: {
    get: testing.fn().mockResolvedValue({data: ticket}),
    create: testing.fn().mockResolvedValue({data: {id: 'created'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'saved'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'ticket-data'}),
  },
  tickets: {
    get: testing.fn().mockResolvedValue({
      data: [ticket],
      meta: {
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
  },
  users: {
    get: testing.fn().mockResolvedValue({
      data: [user1, user2],
      meta: {
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
  user: {
    currentSettings: testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse),
  },
  session: createSession({username: 'admin'}),
});

describe('TicketComponent', () => {
  test('should render child content', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent>{() => <span>Child Content</span>}</TicketComponent>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  test('should open and close create dialog', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent>
        {({createFromResult}) => (
          <Button
            data-testid="open-create"
            onClick={() => createFromResult({id: 'r1', name: 'Result 1'})}
          />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-create'));
    await screen.findByText(/Create new Ticket for Result/);

    fireEvent.click(screen.getDialogCloseButton());
    await waitFor(() => {
      expect(screen.queryByText(/Create new Ticket for Result/)).toBeNull();
    });
  });

  test('should close create dialog after creating a ticket', async () => {
    const gmp = createGmp();
    const onCreated = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent onCreated={onCreated}>
        {({createFromResult}) => (
          <Button
            data-testid="open-create"
            onClick={() => createFromResult({id: 'r1', name: 'Result 1'})}
          />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-create'));
    await screen.findByText(/Create new Ticket for Result/);
    fireEvent.change(screen.getByRole('textbox', {name: 'Note'}), {
      target: {value: 'Ticket note'},
    });
    fireEvent.click(screen.getDialogSaveButton());

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith({data: {id: 'created'}});
      expect(screen.queryByText(/Create new Ticket for Result/)).toBeNull();
    });
  });

  test('should open and close edit dialog', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent>
        {({edit}) => (
          <Button data-testid="open-edit" onClick={() => edit(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    await screen.findByText(/Edit Ticket/);

    fireEvent.click(screen.getDialogCloseButton());
    await waitFor(() => {
      expect(screen.queryByText(/Edit Ticket/)).toBeNull();
    });
  });

  test('should show closed status for a verified ticket', async () => {
    const verifiedTicket = Ticket.fromElement({
      _id: 'tk1',
      name: 'Verified Ticket',
      status: TICKET_STATUS.verified,
    });
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });

    render(
      <TicketComponent>
        {({edit}) => (
          <Button
            data-testid="open-edit"
            onClick={() => edit(verifiedTicket)}
          />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    await screen.findByText(/Edit Ticket/);

    expect(screen.getByName('status')).toHaveValue(TICKET_STATUS.closed);
  });

  test('should show fixed status for a fixed ticket', async () => {
    const fixedTicket = Ticket.fromElement({
      _id: 'tk1',
      name: 'Fixed Ticket',
      status: TICKET_STATUS.fixed,
    });
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });

    render(
      <TicketComponent>
        {({edit}) => (
          <Button data-testid="open-edit" onClick={() => edit(fixedTicket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    await screen.findByText(/Edit Ticket/);

    expect(screen.getByName('status')).toHaveValue(TICKET_STATUS.fixed);
  });

  test('should default to open status when a ticket has no status', async () => {
    const ticketWithoutStatus = Ticket.fromElement({
      _id: 'tk1',
      name: 'Ticket without status',
    });
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });

    render(
      <TicketComponent>
        {({edit}) => (
          <Button
            data-testid="open-edit"
            onClick={() => edit(ticketWithoutStatus)}
          />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    await screen.findByText(/Edit Ticket/);

    expect(screen.getByName('status')).toHaveValue(TICKET_STATUS.open);
  });

  test('should open solve dialog with fixed status', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent>
        {({solve}) => (
          <Button data-testid="open-solve" onClick={() => solve(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-solve'));
    await screen.findByText(/Edit Ticket/);

    fireEvent.click(screen.getDialogCloseButton());
    await waitFor(() => {
      expect(screen.queryByText(/Edit Ticket/)).toBeNull();
    });
  });

  test('should open close dialog with closed status', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(
      <TicketComponent>
        {({close}) => (
          <Button data-testid="open-close" onClick={() => close(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-close'));
    await screen.findByText(/Edit Ticket/);

    fireEvent.click(screen.getDialogCloseButton());
    await waitFor(() => {
      expect(screen.queryByText(/Edit Ticket/)).toBeNull();
    });
  });

  test('should clone ticket', async () => {
    const gmp = createGmp();
    const onCloned = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <TicketComponent onCloned={onCloned}>
        {({clone}) => (
          <Button data-testid="clone" onClick={() => clone(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('clone'));
    await waitFor(() => {
      expect(gmp.ticket.clone).toHaveBeenCalledWith({id: 'tk1'});
      expect(onCloned).toHaveBeenCalledWith({id: 'cloned'});
    });
  });

  test('should delete ticket', async () => {
    const gmp = createGmp();
    const onDeleted = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <TicketComponent onDeleted={onDeleted}>
        {({delete: deleteFn}) => (
          <Button data-testid="delete" onClick={() => deleteFn(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('delete'));
    await waitFor(() => {
      expect(gmp.ticket.delete).toHaveBeenCalledWith({id: 'tk1'});
      expect(onDeleted).toHaveBeenCalled();
    });
  });

  test('should download ticket', async () => {
    const gmp = createGmp();
    const onDownloaded = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <TicketComponent onDownloaded={onDownloaded}>
        {({download}) => (
          <Button data-testid="download" onClick={() => download(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('download'));
    await waitFor(() => {
      expect(gmp.ticket.export).toHaveBeenCalled();
    });
  });

  test('should save edited ticket', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <TicketComponent onSaved={onSaved}>
        {({edit}) => (
          <Button data-testid="open-edit" onClick={() => edit(ticket)} />
        )}
      </TicketComponent>,
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    await screen.findByText(/Edit Ticket/);

    fireEvent.click(screen.getDialogSaveButton());
    await waitFor(() => {
      expect(gmp.ticket.save).toHaveBeenCalled();
      expect(onSaved).toHaveBeenCalled();
    });
  });
});
