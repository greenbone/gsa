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
import Ticket from '../ticket';
import {isDate} from '../date';

import {testModel} from 'gmp/models/testing';

testModel(Ticket, 'ticket');

describe('Additional Ticket Model tests', () => {
  test('should parse assignedTo', () => {
    let ticket = Ticket.fromElement({assigned_to: {}});

    expect(ticket.assigned_to).toBeUndefined();
    expect(ticket.assignedTo).toBeUndefined();

    ticket = Ticket.fromElement({assigned_to: {user: {_id: 'foo'}}});

    expect(ticket.assigned_to).toBeUndefined();
    expect(ticket.assignedTo).toBeDefined();
    expect(ticket.assignedTo.user).toBeDefined();
    expect(ticket.assignedTo.user.id).toEqual('foo');
  });

  test('should parse result', () => {
    let ticket = Ticket.fromElement({});
    expect(ticket.result).toBeUndefined();

    ticket = Ticket.fromElement({result: {_id: 'foo'}});
    expect(ticket.result).toBeDefined();
    expect(ticket.result.id).toEqual('foo');
  });

  test('should parse report', () => {
    let ticket = Ticket.fromElement({});
    expect(ticket.report).toBeUndefined();

    ticket = Ticket.fromElement({report: {_id: 'foo'}});
    expect(ticket.report).toBeDefined();
    expect(ticket.report.id).toEqual('foo');
  });

  test('should parse task', () => {
    let ticket = Ticket.fromElement({});
    expect(ticket.task).toBeUndefined();

    ticket = Ticket.fromElement({task: {_id: 'foo'}});
    expect(ticket.task).toBeDefined();
    expect(ticket.task.id).toEqual('foo');
  });

  test('should parse confirmedReport', () => {
    let ticket = Ticket.fromElement({});
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fix_verified_report).toBeUndefined();

    ticket = Ticket.fromElement({fix_verified_report: {_id: 'foo'}});
    expect(ticket.fixVerifiedReport).toBeDefined();
    expect(ticket.fix_verified_report).toBeUndefined();
    expect(ticket.fixVerifiedReport.id).toEqual('foo');
  });

  test('should parse severity', () => {
    const ticket = Ticket.fromElement({severity: '10.0'});

    expect(ticket.severity).toBe(10);
  });

  test('should parse nvt', () => {
    let ticket = Ticket.fromElement({});
    expect(ticket.nvt).toBeUndefined();

    ticket = Ticket.fromElement({nvt: {_oid: 'foo'}});
    expect(ticket.nvt).toBeDefined();
    expect(ticket.nvt.oid).toEqual('foo');
  });

  test('should parse openTime', () => {
    const ticket = Ticket.fromElement({open_time: '2019-01-01T12:00:00Z'});

    expect(ticket.open_time).toBeUndefined();
    expect(ticket.openTime).toBeDefined();
    expect(isDate(ticket.openTime)).toBe(true);
  });

  test('should parse fixVerifiedTime', () => {
    const ticket = Ticket.fromElement({
      fix_verified_time: '2019-01-01T12:00:00Z',
    });

    expect(ticket.fix_verified_time).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeDefined();
    expect(isDate(ticket.fixVerifiedTime)).toBe(true);
  });

  test('should parse fixedTime', () => {
    const ticket = Ticket.fromElement({fixed_time: '2019-01-01T12:00:00Z'});

    expect(ticket.fixed_time).toBeUndefined();
    expect(ticket.fixedTime).toBeDefined();
    expect(isDate(ticket.fixedTime)).toBe(true);
  });

  test('should parse closedTime', () => {
    const ticket = Ticket.fromElement({closed_time: '2019-01-01T12:00:00Z'});

    expect(ticket.closed_time).toBeUndefined();
    expect(ticket.closedTime).toBeDefined();
    expect(isDate(ticket.closedTime)).toBe(true);
  });

  test('should parse solutionType', () => {
    const ticket = Ticket.fromElement({solution_type: 'foo'});

    expect(ticket.solution_type).toBeUndefined();
    expect(ticket.solutionType).toBeDefined();
    expect(ticket.solutionType).toEqual('foo');
  });

  test('should parse openNote', () => {
    let ticket = Ticket.fromElement({open_note: ''});
    expect(ticket.open_note).toBeUndefined();
    expect(ticket.openNote).toBeUndefined();

    ticket = Ticket.fromElement({open_note: 'foo'});
    expect(ticket.open_note).toBeUndefined();
    expect(ticket.openNote).toBeDefined();
    expect(ticket.openNote).toEqual('foo');
  });

  test('should parse fixedNote', () => {
    let ticket = Ticket.fromElement({fixed_note: ''});
    expect(ticket.fixed_note).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();

    ticket = Ticket.fromElement({fixed_note: 'foo'});
    expect(ticket.fixed_note).toBeUndefined();
    expect(ticket.fixedNote).toBeDefined();
    expect(ticket.fixedNote).toEqual('foo');
  });

  test('should parse closedNote', () => {
    let ticket = Ticket.fromElement({closed_note: ''});
    expect(ticket.closed_note).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();

    ticket = Ticket.fromElement({closed_note: 'foo'});
    expect(ticket.closed_note).toBeUndefined();
    expect(ticket.closedNote).toBeDefined();
    expect(ticket.closedNote).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
