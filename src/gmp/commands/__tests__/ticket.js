/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {TicketCommand} from '../tickets';

import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from '../testing';

describe('TicketCommand tests', () => {
  test('should trim note when creating ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .create({
        resultId: 'r1',
        userId: 'u1',
        foo: 'bar',
        note: ' ',
      })
      .then(resp => {
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
  });

  test('should create new ticket with note', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .create({
        resultId: 'r1',
        userId: 'u1',
        note: 'foo',
        foo: 'bar',
      })
      .then(resp => {
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

  test('should save a ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .save({
        id: 'foo',
        status: 'fixed',
        userId: 'u1',
        openNote: 'bar',
        fixedNote: 'bar',
        closedNote: 'bar',
      })
      .then(() => {
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
  });

  test('should trim note when saving a ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .save({
        id: 'foo',
        status: 'fixed',
        userId: 'u1',
        openNote: '   bar   ',
        fixedNote: '   bar   ',
        closedNote: '   bar   ',
      })
      .then(() => {
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
  });

  test('should delete a ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .delete({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'delete_ticket',
            ticket_id: 'foo',
          },
        });
      });
  });

  test('should clone a ticket', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TicketCommand(fakeHttp);
    return cmd
      .clone({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'clone',
            id: 'foo',
            resource_type: 'ticket',
          },
        });
      });
  });
});
