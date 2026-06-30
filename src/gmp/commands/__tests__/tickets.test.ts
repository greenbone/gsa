/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import TicketsCommand from 'gmp/commands/tickets';
import {ALL_FILTER} from 'gmp/models/filter';
import Ticket from 'gmp/models/ticket';

describe('TicketsCommand tests', () => {
  test('should fetch all tickets', async () => {
    const response = createEntitiesResponse('ticket', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new TicketsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tickets',
        filter: ALL_FILTER.toFilterString(),
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch tickets with default params', async () => {
    const response = createEntitiesResponse('ticket', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new TicketsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tickets',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch tickets with custom params', async () => {
    const response = createEntitiesResponse('ticket', [
      {
        _id: '1',
        status: 'open',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new TicketsCommand(fakeHttp);
    const resp = await cmd.get({filter: "status='open'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tickets',
        filter: "status='open'",
      },
    });
    expect(resp.data).toEqual([
      new Ticket({
        id: '1',
        status: 'open',
      }),
    ]);
  });
});
