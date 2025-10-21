/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {TicketCommand} from 'gmp/commands/tickets';

describe('TicketCommand tests', () => {
  test('should trim note when creating ticket', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    const resp = await cmd.create({
      resultId: 'r1',
      userId: 'u1',
      foo: 'bar',
      note: ' ',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_ticket',
        result_id: 'r1',
        user_id: 'u1',
        note: '',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create new ticket with note', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    const resp = await cmd.create({
      resultId: 'r1',
      userId: 'u1',
      note: 'foo',
      foo: 'bar',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_ticket',
        result_id: 'r1',
        user_id: 'u1',
        note: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should return single ticket', async () => {
    const response = createEntityResponse('ticket', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_ticket',
        ticket_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save a ticket', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    await cmd.save({
      id: 'foo',
      status: 'fixed',
      userId: 'u1',
      openNote: 'bar',
      fixedNote: 'bar',
      closedNote: 'bar',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_ticket',
        ticket_id: 'foo',
        ticket_status: 'fixed',
        open_note: 'bar',
        fixed_note: 'bar',
        closed_note: 'bar',
        user_id: 'u1',
      },
    });
  });

  test('should trim note when saving a ticket', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    await cmd.save({
      id: 'foo',
      status: 'fixed',
      userId: 'u1',
      openNote: '   bar   ',
      fixedNote: '   bar   ',
      closedNote: '   bar   ',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_ticket',
        ticket_id: 'foo',
        ticket_status: 'fixed',
        open_note: 'bar',
        fixed_note: 'bar',
        closed_note: 'bar',
        user_id: 'u1',
      },
    });
  });

  test('should delete a ticket', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    await cmd.delete({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_ticket',
        ticket_id: 'foo',
      },
    });
  });

  test('should clone a ticket', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TicketCommand(fakeHttp);
    await cmd.clone({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        id: 'foo',
        resource_type: 'ticket',
      },
    });
  });
});
