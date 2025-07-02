/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Nvt from 'gmp/models/nvt';
import Result, {Delta} from 'gmp/models/result';
import {testModel} from 'gmp/models/testing';

describe('Result model tests', () => {
  testModel(Result, 'result');

  test('should use defaults', () => {
    const result = new Result();
    expect(result.compliance).toBeUndefined();
    expect(result.delta).toBeUndefined();
    expect(result.detection).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.host).toBeUndefined();
    expect(result.information).toBeUndefined();
    expect(result.notes).toEqual([]);
    expect(result.original_severity).toBeUndefined();
    expect(result.overrides).toEqual([]);
    expect(result.port).toBeUndefined();
    expect(result.qod).toBeUndefined();
    expect(result.report).toBeUndefined();
    expect(result.scan_nvt_version).toBeUndefined();
    expect(result.severity).toBeUndefined();
    expect(result.task).toBeUndefined();
    expect(result.tickets).toEqual([]);
    expect(result.vulnerability).toBeUndefined();
  });

  test('should parse empty element', () => {
    const result = Result.fromElement();
    expect(result.compliance).toBeUndefined();
    expect(result.delta).toBeUndefined();
    expect(result.detection).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.host).toBeUndefined();
    expect(result.information).toBeUndefined();
    expect(result.notes).toEqual([]);
    expect(result.original_severity).toBeUndefined();
    expect(result.overrides).toEqual([]);
    expect(result.port).toBeUndefined();
    expect(result.qod).toBeUndefined();
    expect(result.report).toBeUndefined();
    expect(result.scan_nvt_version).toBeUndefined();
    expect(result.severity).toBeUndefined();
    expect(result.task).toBeUndefined();
    expect(result.tickets).toEqual([]);
    expect(result.vulnerability).toBeUndefined();
  });

  test('should parse host', () => {
    const result = Result.fromElement({
      host: {
        __text: 'foo',
        asset: {
          _asset_id: '123',
        },
        hostname: 'bar',
      },
    });
    expect(result.host).toEqual({
      name: 'foo',
      id: '123',
      hostname: 'bar',
    });

    const result2 = Result.fromElement({
      host: {
        __text: 'foo',
      },
    });
    expect(result2.host).toEqual({
      name: 'foo',
    });

    const result3 = Result.fromElement({
      host: {
        asset: {_asset_id: ''},
        __text: 'foo',
        hostname: 'bar',
      },
    });
    expect(result3.host).toEqual({
      name: 'foo',
      hostname: 'bar',
    });
  });

  test('should parse NVT', () => {
    const result = Result.fromElement({
      nvt: {
        _oid: 'bar',
        type: 'nvt',
      },
    });
    expect(result.information).toBeInstanceOf(Nvt);
    expect(result.information?.id).toEqual('bar');
  });

  test('should parse CVE', () => {
    const result = Result.fromElement({
      nvt: {
        name: 'CVE-1234',
        type: 'cve',
      },
    });

    expect(result.information?.id).toEqual('CVE-1234');
    expect(result.information?.name).toEqual('CVE-1234');
    expect(result.name).toEqual('CVE-1234');
  });

  test('should parse severity', () => {
    const result = Result.fromElement({severity: 4.2});
    expect(result.severity).toEqual(4.2);
  });

  test('should parse vulnerability', () => {
    const result = Result.fromElement({name: 'foo'});
    expect(result.vulnerability).toEqual('foo');

    const result2 = Result.fromElement({
      nvt: {
        _oid: '42',
      },
    });
    expect(result2.vulnerability).toEqual('42');
  });

  test('should parse report', () => {
    const result = Result.fromElement({report: {_id: 'foo'}});
    expect(result.report?.id).toEqual('foo');
    expect(result.report?.entityType).toEqual('report');
  });

  test('should parse task', () => {
    const result = Result.fromElement({task: {_id: 'foo'}});
    expect(result.task?.id).toEqual('foo');
    expect(result.task?.entityType).toEqual('task');
  });

  test('should parse detection', () => {
    const result = Result.fromElement({
      detection: {
        result: {
          _id: '1337',
          details: {
            detail: [
              {
                name: 'foo',
                value: 'bar',
              },
              {
                name: 'lorem',
                value: 'ipsum',
              },
            ],
          },
        },
      },
    });
    expect(result.detection).toEqual({
      result: {
        id: '1337',
        details: {
          foo: 'bar',
          lorem: 'ipsum',
        },
      },
    });
  });

  test('should parse delta', () => {
    const result = Result.fromElement({delta: 'foo'});
    expect(result.delta).toBeInstanceOf(Delta);
    expect(result.delta?.delta_type).toEqual('foo');

    const result2 = Result.fromElement({
      delta: {
        __text: 'foo',
      },
    });
    expect(result2.delta).toBeInstanceOf(Delta);
    expect(result2.delta?.delta_type).toEqual('foo');

    const result3 = Result.fromElement({
      delta: {
        __text: Delta.TYPE_CHANGED,
        diff: 'some foobar diff',
        result: {
          _id: 'r1',
          description: 'some result description',
        },
      },
    });
    expect(result3.delta).toBeInstanceOf(Delta);
    expect(result3.delta?.delta_type).toEqual(Delta.TYPE_CHANGED);
    expect(result3.delta?.diff).toEqual('some foobar diff');
    expect(result3.delta?.result?.description).toEqual(
      'some result description',
    );
  });

  test('should parse original severity', () => {
    const result = Result.fromElement({original_severity: 4.2});
    expect(result.original_severity).toEqual(4.2);
  });

  test('should parse QoD', () => {
    const result = Result.fromElement({
      qod: {
        type: 'foo',
        value: '42.5',
      },
    });
    expect(result.qod?.type).toEqual('foo');
    expect(result.qod?.value).toEqual(42.5);
  });

  test('should parse notes', () => {
    const result = Result.fromElement({
      notes: {
        note: [
          {
            _id: 'foo',
          },

          {
            _id: 'bar',
          },
        ],
      },
    });

    expect(result.notes?.[0].entityType).toEqual('note');
    expect(result.notes?.[0].id).toEqual('foo');
    expect(result.notes?.[1].entityType).toEqual('note');
    expect(result.notes?.[1].id).toEqual('bar');

    const result2 = Result.fromElement({
      notes: {
        note: {
          _id: 'baz',
        },
      },
    });
    expect(result2.notes?.[0].entityType).toEqual('note');
    expect(result2.notes?.[0].id).toEqual('baz');
  });

  test('should parse overrides', () => {
    const result = Result.fromElement({
      overrides: {
        override: [{_id: 'foo'}, {_id: 'bar'}],
      },
    });
    expect(result.overrides[0].entityType).toEqual('override');
    expect(result.overrides[0].id).toEqual('foo');
    expect(result.overrides[1].entityType).toEqual('override');
    expect(result.overrides[1].id).toEqual('bar');

    const result2 = Result.fromElement({
      overrides: {
        override: {_id: 'baz'},
      },
    });
    expect(result2.overrides[0].entityType).toEqual('override');
    expect(result2.overrides[0].id).toEqual('baz');
  });

  test('should parse compliance', () => {
    const result = Result.fromElement({
      compliance: 'undefined',
    });
    expect(result.compliance).toEqual('undefined');
  });

  test('should parse description', () => {
    const result = Result.fromElement({
      description: 'This is a test description',
    });
    expect(result.description).toEqual('This is a test description');
  });

  test('should parse tickets', () => {
    const result = Result.fromElement({
      tickets: {
        ticket: [{_id: 'foo'}, {_id: 'bar'}],
      },
    });
    expect(result.tickets[0].entityType).toEqual('ticket');
    expect(result.tickets[0].id).toEqual('foo');
    expect(result.tickets[1].entityType).toEqual('ticket');
    expect(result.tickets[1].id).toEqual('bar');

    const result2 = Result.fromElement({
      tickets: {
        ticket: {_id: 'baz'},
      },
    });
    expect(result2.tickets[0].entityType).toEqual('ticket');
    expect(result2.tickets[0].id).toEqual('baz');
  });

  test('should parse port', () => {
    const result = Result.fromElement({port: '1234/tcp'});
    expect(result.port).toEqual('1234/tcp');
  });

  test('should parse scan_nvt_version', () => {
    const result = Result.fromElement({scan_nvt_version: '1.2.3'});
    expect(result.scan_nvt_version).toEqual('1.2.3');
  });

  test('hasDelta() should return correct true/false', () => {
    const result = Result.fromElement({delta: 'defined'});
    const result2 = Result.fromElement();

    expect(result.hasDelta()).toEqual(true);
    expect(result2.hasDelta()).toEqual(false);
  });
});
