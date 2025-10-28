/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import {TicketsCommand} from 'gmp/commands/tickets';
import {ALL_FILTER} from 'gmp/models/filter';

describe('TicketsCommand tests', () => {
  test('should return all tickets', async () => {
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

  test('should return tickets', async () => {
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
});
