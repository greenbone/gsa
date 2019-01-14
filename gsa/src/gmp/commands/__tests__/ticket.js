/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {TicketCommand} from '../tickets';

import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from '../testing';

describe('TicketCommand tests', () => {

  test('should create new ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd.create({
      resultId: 'r1',
      userId: 'u1',
      foo: 'bar',
    }).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: {
          cmd: 'create_ticket',
          result_id: 'r1',
          user_id: 'u1',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

  test('should return single ticket', () => {
    const response = createEntityResponse('ticket', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_ticket',
          ticket_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

});
