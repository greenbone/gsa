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
import Ticket from '../ticket';
import {isDate} from '../date';

import {testModel} from 'gmp/models/testing';

testModel(Ticket, 'ticket');

describe('Additional Ticket Model tests', () => {
  test('should parse assignedTo', () => {
    let ticket = new Ticket({assigned_to: {}});

    expect(ticket.assigned_to).toBeUndefined();
    expect(ticket.assignedTo).toBeUndefined();

    ticket = new Ticket({assigned_to: {user: {_id: 'foo'}}});

    expect(ticket.assigned_to).toBeUndefined();
    expect(ticket.assignedTo).toBeDefined();
    expect(ticket.assignedTo.user).toBeDefined();
    expect(ticket.assignedTo.user.id).toEqual('foo');
  });

  test('should parse result', () => {
    let ticket = new Ticket({});
    expect(ticket.result).toBeUndefined();

    ticket = new Ticket({result: {_id: 'foo'}});
    expect(ticket.result).toBeDefined();
    expect(ticket.result.id).toEqual('foo');
  });

  test('should parse report', () => {
    let ticket = new Ticket({});
    expect(ticket.report).toBeUndefined();

    ticket = new Ticket({report: {_id: 'foo'}});
    expect(ticket.report).toBeDefined();
    expect(ticket.report.id).toEqual('foo');
  });

  test('should parse task', () => {
    let ticket = new Ticket({});
    expect(ticket.task).toBeUndefined();

    ticket = new Ticket({task: {_id: 'foo'}});
    expect(ticket.task).toBeDefined();
    expect(ticket.task.id).toEqual('foo');
  });

  test('should parse confirmedReport', () => {
    let ticket = new Ticket({});
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fix_verified_report).toBeUndefined();

    ticket = new Ticket({fix_verified_report: {_id: 'foo'}});
    expect(ticket.fixVerifiedReport).toBeDefined();
    expect(ticket.fix_verified_report).toBeUndefined();
    expect(ticket.fixVerifiedReport.id).toEqual('foo');
  });

  test('should parse severity', () => {
    const ticket = new Ticket({severity: '10.0'});

    expect(ticket.severity).toBe(10);
  });

  test('should parse nvt', () => {
    let ticket = new Ticket({});
    expect(ticket.nvt).toBeUndefined();

    ticket = new Ticket({nvt: {_oid: 'foo'}});
    expect(ticket.nvt).toBeDefined();
    expect(ticket.nvt.oid).toEqual('foo');
  });

  test('should parse openTime', () => {
    const ticket = new Ticket({open_time: '2019-01-01T12:00:00Z'});

    expect(ticket.open_time).toBeUndefined();
    expect(ticket.openTime).toBeDefined();
    expect(isDate(ticket.openTime)).toBe(true);
  });

  test('should parse fixVerifiedTime', () => {
    const ticket = new Ticket({fix_verified_time: '2019-01-01T12:00:00Z'});

    expect(ticket.fix_verified_time).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeDefined();
    expect(isDate(ticket.fixVerifiedTime)).toBe(true);
  });

  test('should parse fixedTime', () => {
    const ticket = new Ticket({fixed_time: '2019-01-01T12:00:00Z'});

    expect(ticket.fixed_time).toBeUndefined();
    expect(ticket.fixedTime).toBeDefined();
    expect(isDate(ticket.fixedTime)).toBe(true);
  });

  test('should parse closedTime', () => {
    const ticket = new Ticket({closed_time: '2019-01-01T12:00:00Z'});

    expect(ticket.closed_time).toBeUndefined();
    expect(ticket.closedTime).toBeDefined();
    expect(isDate(ticket.closedTime)).toBe(true);
  });

  test('should parse solutionType', () => {
    const ticket = new Ticket({solution_type: 'foo'});

    expect(ticket.solution_type).toBeUndefined();
    expect(ticket.solutionType).toBeDefined();
    expect(ticket.solutionType).toEqual('foo');
  });

  test('should parse openNote', () => {
    let ticket = new Ticket({open_note: ''});
    expect(ticket.open_note).toBeUndefined();
    expect(ticket.openNote).toBeUndefined();

    ticket = new Ticket({open_note: 'foo'});
    expect(ticket.open_note).toBeUndefined();
    expect(ticket.openNote).toBeDefined();
    expect(ticket.openNote).toEqual('foo');
  });

  test('should parse fixedNote', () => {
    let ticket = new Ticket({fixed_note: ''});
    expect(ticket.fixed_note).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();

    ticket = new Ticket({fixed_note: 'foo'});
    expect(ticket.fixed_note).toBeUndefined();
    expect(ticket.fixedNote).toBeDefined();
    expect(ticket.fixedNote).toEqual('foo');
  });

  test('should parse closedNote', () => {
    let ticket = new Ticket({closed_note: ''});
    expect(ticket.closed_note).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();

    ticket = new Ticket({closed_note: 'foo'});
    expect(ticket.closed_note).toBeUndefined();
    expect(ticket.closedNote).toBeDefined();
    expect(ticket.closedNote).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
