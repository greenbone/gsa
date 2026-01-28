/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {isDate} from 'gmp/models/date';
import ReportHost from 'gmp/models/report/host';
import {parseDate} from 'gmp/parser';

describe('ReportHost tests', () => {
  test('should use defaults', () => {
    const host = new ReportHost();
    expect(host.asset).toBeUndefined();
    expect(host.authSuccess).toEqual({});
    expect(host.complianceCounts).toEqual({
      yes: 0,
      no: 0,
      undefined: 0,
      incomplete: 0,
      total: 0,
    });
    expect(host.hostCompliance).toEqual('undefined');
    expect(host.hostname).toBeUndefined();
    expect(host.id).toBeUndefined();
    expect(host.ip).toBeUndefined();
    expect(host.portsCount).toEqual(0);
    expect(host.start).toBeUndefined();
    expect(isDate(host.end)).toEqual(false);
    expect(host.details).toEqual({});
    expect(host.result_counts).toBeDefined();
    expect(host.result_counts.false_positive).toEqual(0);
    expect(host.result_counts.critical).toEqual(0);
    expect(host.result_counts.high).toEqual(0);
    expect(host.result_counts.medium).toEqual(0);
    expect(host.result_counts.log).toEqual(0);
    expect(host.result_counts.low).toEqual(0);
    expect(host.result_counts.total).toEqual(0);
  });

  test('should parse empty element', () => {
    const host = ReportHost.fromElement();
    expect(host.asset).toBeUndefined();
    expect(host.authSuccess).toEqual({});
    expect(host.complianceCounts).toEqual({
      yes: 0,
      no: 0,
      incomplete: 0,
      total: 0,
      undefined: 0,
    });
    expect(host.hostCompliance).toEqual('undefined');
    expect(host.hostname).toBeUndefined();
    expect(host.id).toBeUndefined();
    expect(host.ip).toBeUndefined();
    expect(host.portsCount).toEqual(0);
    expect(isDate(host.start)).toEqual(false);
    expect(isDate(host.end)).toEqual(false);
    expect(host.details).toEqual({});
    expect(host.result_counts).toBeDefined();
    expect(host.result_counts.false_positive).toEqual(0);
    expect(host.result_counts.critical).toEqual(0);
    expect(host.result_counts.high).toEqual(0);
    expect(host.result_counts.medium).toEqual(0);
    expect(host.result_counts.log).toEqual(0);
    expect(host.result_counts.low).toEqual(0);
    expect(host.result_counts.total).toEqual(0);
  });

  test('should parse asset', () => {
    const host = ReportHost.fromElement({
      asset: {
        _asset_id: 'a1',
      },
    });
    expect(host.asset).toBeDefined();
    expect(host.asset?.id).toEqual('a1');
  });

  test('should parse port count', () => {
    const host1 = ReportHost.fromElement({
      port_count: {},
    });
    expect(host1.portsCount).toEqual(0);

    const host2 = ReportHost.fromElement({
      port_count: {
        page: 2,
      },
    });
    expect(host2.portsCount).toEqual(2);
  });

  test('should parse result counts', () => {
    const host1 = ReportHost.fromElement({
      result_count: {
        hole: {
          _deprecated: '1',
        },
        warning: {
          _deprecated: '1',
        },
        info: {
          _deprecated: '1',
        },
        log: {},
        false_positive: {},
      },
    });

    expect(host1.result_counts.total).toEqual(0);
    expect(host1.result_counts.high).toEqual(0);
    expect(host1.result_counts.medium).toEqual(0);
    expect(host1.result_counts.low).toEqual(0);
    expect(host1.result_counts.log).toEqual(0);
    expect(host1.result_counts.false_positive).toEqual(0);

    const host2 = ReportHost.fromElement({
      result_count: {
        page: 6,
        hole: {
          _deprecated: '1',
          page: 1,
        },
        high: {
          page: 1,
        },
        medium: {
          page: 2,
        },
        warning: {
          _deprecated: '1',
          page: 2,
        },
        info: {
          _deprecated: '1',
          page: 3,
        },
        low: {
          page: 3,
        },
        log: {
          page: 4,
        },
        false_positive: {
          page: 5,
        },
      },
    });

    expect(host2.result_counts.total).toEqual(6);
    expect(host2.result_counts.high).toEqual(1);
    expect(host2.result_counts.medium).toEqual(2);
    expect(host2.result_counts.low).toEqual(3);
    expect(host2.result_counts.log).toEqual(4);
    expect(host2.result_counts.false_positive).toEqual(5);

    const host3 = ReportHost.fromElement({
      result_count: {
        page: 7,
        critical: {
          page: 1,
        },
      },
    });
    expect(host3.result_counts.total).toEqual(7);
    expect(host3.result_counts.critical).toEqual(1);
  });

  test('should parse start', () => {
    const host = ReportHost.fromElement({
      start: '2019-10-02T12:17:10+02:00',
    });
    expect(host.start).toEqual(parseDate('2019-10-02T12:17:10+02:00'));
  });

  test('should parse end', () => {
    const host = ReportHost.fromElement({
      end: '2019-10-02T12:29:22+02:00',
    });
    expect(host.end).toEqual(parseDate('2019-10-02T12:29:22+02:00'));
  });

  test('should parse auth success information', () => {
    const host = ReportHost.fromElement({
      detail: [
        {
          name: 'Auth-SNMP-Failure',
        },
        {
          name: 'Auth-SSH-Success',
        },
      ],
    });

    expect(host.authSuccess.snmp).toEqual(false);
    expect(host.authSuccess.ssh).toEqual(true);
  });

  test('should parse app information', () => {
    const host = ReportHost.fromElement({
      detail: [
        {
          name: 'App',
          value: 'cpe1',
        },
        {
          name: 'App',
          value: 'cpe2',
        },
      ],
    });

    expect(host.details?.appsCount).toEqual(2);
  });

  test('should parse agentID', () => {
    const host = ReportHost.fromElement({
      detail: [
        {
          name: 'agentID',
          value: 'agent-123',
        },
      ],
    });

    expect(host.details?.agentId).toEqual('agent-123');
  });

  test('should parse detail information', () => {
    const host = ReportHost.fromElement({
      detail: [
        {
          name: 'hostname',
          value: 'foo.bar',
        },
        {
          name: 'best_os_cpe',
          value: 'cpe:/foo/bar',
        },
        {
          name: 'best_os_txt',
          value: 'Foo OS',
        },
        {
          name: 'traceroute',
          value: '1.1.1.1,2.2.2.2,3.3.3.3',
        },
      ],
    });

    expect(host.hostname).toEqual('foo.bar');
    expect(host.details?.best_os_cpe).toEqual('cpe:/foo/bar');
    expect(host.details?.best_os_txt).toEqual('Foo OS');
    expect(host.details?.distance).toEqual(2);
  });

  test('should parse ip as id', () => {
    const host = ReportHost.fromElement({
      ip: '1.2.3.4',
    });
    expect(host.ip).toEqual('1.2.3.4');
    expect(host.id).toEqual('1.2.3.4');
  });

  test('should parse severity', () => {
    const host = ReportHost.fromElement({
      severity: 5.5,
    });
    expect(host.severity).toEqual(5.5);
  });
});
