/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {testModel} from 'gmp/models/testing';
import Ticket from 'gmp/models/ticket';
import {parseDate} from 'gmp/parser';

testModel(Ticket, 'ticket');

describe('Ticket Model tests', () => {
  test('should use defaults', () => {
    const ticket = new Ticket();
    expect(ticket.assignedTo).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();
    expect(ticket.closedTime).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();
    expect(ticket.fixedTime).toBeUndefined();
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeUndefined();
    expect(ticket.nvt).toBeUndefined();
    expect(ticket.openNote).toBeUndefined();
    expect(ticket.openTime).toBeUndefined();
    expect(ticket.result).toBeUndefined();
    expect(ticket.report).toBeUndefined();
    expect(ticket.severity).toBeUndefined();
    expect(ticket.solutionType).toBeUndefined();
    expect(ticket.status).toBeUndefined();
    expect(ticket.task).toBeUndefined();
  });

  test('should parse empty element', () => {
    const ticket = Ticket.fromElement();
    expect(ticket.assignedTo).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();
    expect(ticket.closedTime).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();
    expect(ticket.fixedTime).toBeUndefined();
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeUndefined();
    expect(ticket.nvt).toBeUndefined();
    expect(ticket.openNote).toBeUndefined();
    expect(ticket.openTime).toBeUndefined();
    expect(ticket.result).toBeUndefined();
    expect(ticket.report).toBeUndefined();
    expect(ticket.severity).toBeUndefined();
    expect(ticket.solutionType).toBeUndefined();
    expect(ticket.status).toBeUndefined();
    expect(ticket.task).toBeUndefined();
  });

  test('should parse assignedTo', () => {
    const ticket = Ticket.fromElement({assigned_to: {user: {_id: 'foo'}}});
    expect(ticket.assignedTo?.id).toEqual('foo');
  });

  test('should parse result', () => {
    const ticket = Ticket.fromElement({result: {_id: 'foo'}});
    expect(ticket.result?.id).toEqual('foo');
  });

  test('should parse report', () => {
    const ticket = Ticket.fromElement({report: {_id: 'foo'}});
    expect(ticket.report?.id).toEqual('foo');
  });

  test('should parse task', () => {
    const ticket = Ticket.fromElement({task: {_id: 'foo'}});
    expect(ticket.task?.id).toEqual('foo');
  });

  test('should parse fixVerifiedReport', () => {
    const ticket = Ticket.fromElement({fix_verified_report: {_id: 'foo'}});
    expect(ticket.fixVerifiedReport).toBeDefined();
    expect(ticket.fixVerifiedReport?.id).toEqual('foo');
  });

  test('should parse severity', () => {
    const ticket = Ticket.fromElement({severity: 10.0});
    expect(ticket.severity).toBe(10);
  });

  test('should parse nvt', () => {
    const ticket = Ticket.fromElement({nvt: {_oid: 'foo'}});
    expect(ticket.nvt?.oid).toEqual('foo');
  });

  test('should parse openTime', () => {
    const ticket = Ticket.fromElement({open_time: '2019-01-01T12:00:00Z'});
    expect(ticket.openTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse fixVerifiedTime', () => {
    const ticket = Ticket.fromElement({
      fix_verified_time: '2019-01-01T12:00:00Z',
    });
    expect(ticket.fixVerifiedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse fixedTime', () => {
    const ticket = Ticket.fromElement({fixed_time: '2019-01-01T12:00:00Z'});
    expect(ticket.fixedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse closedTime', () => {
    const ticket = Ticket.fromElement({closed_time: '2019-01-01T12:00:00Z'});
    expect(ticket.closedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse solutionType', () => {
    const ticket = Ticket.fromElement({solution_type: 'foo'});
    expect(ticket.solutionType).toEqual('foo');
  });

  test('should parse openNote', () => {
    let ticket = Ticket.fromElement({open_note: ''});
    expect(ticket.openNote).toBeUndefined();

    ticket = Ticket.fromElement({open_note: 'foo'});
    expect(ticket.openNote).toEqual('foo');
  });

  test('should parse fixedNote', () => {
    let ticket = Ticket.fromElement({fixed_note: ''});
    expect(ticket.fixedNote).toBeUndefined();

    ticket = Ticket.fromElement({fixed_note: 'foo'});
    expect(ticket.fixedNote).toEqual('foo');
  });

  test('should parse closedNote', () => {
    let ticket = Ticket.fromElement({closed_note: ''});
    expect(ticket.closedNote).toBeUndefined();

    ticket = Ticket.fromElement({closed_note: 'foo'});
    expect(ticket.closedNote).toEqual('foo');
  });

  test('should parse status', () => {
    const ticket = Ticket.fromElement({status: 'open'});
    expect(ticket.status).toEqual('open');

    const ticket2 = Ticket.fromElement({status: 'closed'});
    expect(ticket2.status).toEqual('closed');

    const ticket3 = Ticket.fromElement({status: 'fixed'});
    expect(ticket3.status).toEqual('fixed');

    const ticket4 = Ticket.fromElement({status: 'verified'});
    expect(ticket4.status).toEqual('verified');
  });
});
