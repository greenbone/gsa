/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {testModel} from 'gmp/models/testing';
import Ticket from 'gmp/models/ticket';
import {parseDate} from 'gmp/parser';

describe('Ticket Model tests', () => {
  testModel(Ticket, 'ticket');

  test('should use defaults', () => {
    const ticket = new Ticket({id: 'test-id'});
    expect(ticket.id).toEqual('test-id');
    expect(ticket.assignedTo).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();
    expect(ticket.closedTime).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();
    expect(ticket.fixedTime).toBeUndefined();
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeUndefined();
    expect(ticket.host).toBeUndefined();
    expect(ticket.location).toBeUndefined();
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
    const ticket = Ticket.fromElement({_id: 'test-id'});
    expect(ticket.id).toEqual('test-id');
    expect(ticket.assignedTo).toBeUndefined();
    expect(ticket.closedNote).toBeUndefined();
    expect(ticket.closedTime).toBeUndefined();
    expect(ticket.fixedNote).toBeUndefined();
    expect(ticket.fixedTime).toBeUndefined();
    expect(ticket.fixVerifiedReport).toBeUndefined();
    expect(ticket.fixVerifiedTime).toBeUndefined();
    expect(ticket.host).toBeUndefined();
    expect(ticket.location).toBeUndefined();
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
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      assigned_to: {user: {_id: 'foo'}},
    });
    expect(ticket.assignedTo?.id).toEqual('foo');
  });

  test('should parse result', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', result: {_id: 'foo'}});
    expect(ticket.result?.id).toEqual('foo');
  });

  test('should parse report', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', report: {_id: 'foo'}});
    expect(ticket.report?.id).toEqual('foo');
  });

  test('should parse task', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', task: {_id: 'foo'}});
    expect(ticket.task?.id).toEqual('foo');
  });

  test('should parse fixVerifiedReport', () => {
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      fix_verified_report: {_id: 'foo'},
    });
    expect(ticket.fixVerifiedReport).toBeDefined();
    expect(ticket.fixVerifiedReport?.id).toEqual('foo');
  });

  test('should parse severity', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', severity: 10.0});
    expect(ticket.severity).toBe(10);
  });

  test('should parse nvt', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', nvt: {_oid: 'foo'}});
    expect(ticket.nvt?.oid).toEqual('foo');
  });

  test('should parse openTime', () => {
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      open_time: '2019-01-01T12:00:00Z',
    });
    expect(ticket.openTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse fixVerifiedTime', () => {
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      fix_verified_time: '2019-01-01T12:00:00Z',
    });
    expect(ticket.fixVerifiedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse fixedTime', () => {
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      fixed_time: '2019-01-01T12:00:00Z',
    });
    expect(ticket.fixedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse closedTime', () => {
    const ticket = Ticket.fromElement({
      _id: 'test-id',
      closed_time: '2019-01-01T12:00:00Z',
    });
    expect(ticket.closedTime).toEqual(parseDate('2019-01-01T12:00:00Z'));
  });

  test('should parse host', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', host: 'foo'});
    expect(ticket.host).toEqual('foo');
  });

  test('should parse location', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', location: 'foo'});
    expect(ticket.location).toEqual('foo');
  });

  test('should parse solutionType', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', solution_type: 'foo'});
    expect(ticket.solutionType).toEqual('foo');
  });

  test('should parse openNote', () => {
    let ticket = Ticket.fromElement({_id: 'test-id', open_note: ''});
    expect(ticket.openNote).toBeUndefined();

    ticket = Ticket.fromElement({_id: 'test-id', open_note: 'foo'});
    expect(ticket.openNote).toEqual('foo');
  });

  test('should parse fixedNote', () => {
    let ticket = Ticket.fromElement({_id: 'test-id', fixed_note: ''});
    expect(ticket.fixedNote).toBeUndefined();

    ticket = Ticket.fromElement({_id: 'test-id', fixed_note: 'foo'});
    expect(ticket.fixedNote).toEqual('foo');
  });

  test('should parse closedNote', () => {
    let ticket = Ticket.fromElement({_id: 'test-id', closed_note: ''});
    expect(ticket.closedNote).toBeUndefined();

    ticket = Ticket.fromElement({_id: 'test-id', closed_note: 'foo'});
    expect(ticket.closedNote).toEqual('foo');
  });

  test('should parse status', () => {
    const ticket = Ticket.fromElement({_id: 'test-id', status: 'open'});
    expect(ticket.status).toEqual('open');

    const ticket2 = Ticket.fromElement({_id: 'test-id', status: 'closed'});
    expect(ticket2.status).toEqual('closed');

    const ticket3 = Ticket.fromElement({_id: 'test-id', status: 'fixed'});
    expect(ticket3.status).toEqual('fixed');

    const ticket4 = Ticket.fromElement({_id: 'test-id', status: 'verified'});
    expect(ticket4.status).toEqual('verified');
  });
});
