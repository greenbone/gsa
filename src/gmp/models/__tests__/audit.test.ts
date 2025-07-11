/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Audit, {
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUDIT_STATUS,
  USAGE_TYPE,
  AuditStatus,
} from 'gmp/models/audit';
import {testModel} from 'gmp/models/testing';
import {parseDate, parseDuration} from 'gmp/parser';

describe('Audit model tests', () => {
  testModel(Audit, 'audit', {testIsActive: false});

  test('should use defaults', () => {
    const audit = new Audit();
    expect(audit.alerts).toEqual([]);
    expect(audit.alterable).toBeUndefined();
    expect(audit.apply_overrides).toBeUndefined();
    expect(audit.auto_delete).toBeUndefined();
    expect(audit.auto_delete_data).toBeUndefined();
    expect(audit.average_duration).toBeUndefined();
    expect(audit.config).toBeUndefined();
    expect(audit.current_report).toBeUndefined();
    expect(audit.first_report).toBeUndefined();
    expect(audit.hosts_ordering).toBeUndefined();
    expect(audit.in_assets).toBeUndefined();
    expect(audit.last_report).toBeUndefined();
    expect(audit.max_checks).toBeUndefined();
    expect(audit.max_hosts).toBeUndefined();
    expect(audit.min_qod).toBeUndefined();
    expect(audit.observers).toBeUndefined();
    expect(audit.preferences).toEqual({});
    expect(audit.progress).toBeUndefined();
    expect(audit.report_count).toBeUndefined();
    expect(audit.result_count).toBeUndefined();
    expect(audit.schedule_periods).toBeUndefined();
    expect(audit.schedule).toBeUndefined();
    expect(audit.scanner).toBeUndefined();
    expect(audit.second_last_report).toBeUndefined();
    expect(audit.slave).toBeUndefined();
    expect(audit.status).toEqual(AUDIT_STATUS.unknown);
    expect(audit.target).toBeUndefined();
    expect(audit.trend).toBeUndefined();
    expect(audit.usageType).toEqual(USAGE_TYPE.audit);
  });

  test('should parse empty element', () => {
    const audit = Audit.fromElement();
    expect(audit.alerts).toEqual([]);
    expect(audit.alterable).toBeUndefined();
    expect(audit.apply_overrides).toBeUndefined();
    expect(audit.auto_delete).toBeUndefined();
    expect(audit.auto_delete_data).toBeUndefined();
    expect(audit.average_duration).toBeUndefined();
    expect(audit.config).toBeUndefined();
    expect(audit.current_report).toBeUndefined();
    expect(audit.first_report).toBeUndefined();
    expect(audit.hosts_ordering).toBeUndefined();
    expect(audit.in_assets).toBeUndefined();
    expect(audit.last_report).toBeUndefined();
    expect(audit.max_checks).toBeUndefined();
    expect(audit.max_hosts).toBeUndefined();
    expect(audit.min_qod).toBeUndefined();
    expect(audit.observers).toBeUndefined();
    expect(audit.preferences).toEqual({});
    expect(audit.progress).toBeUndefined();
    expect(audit.report_count).toBeUndefined();
    expect(audit.result_count).toBeUndefined();
    expect(audit.schedule_periods).toBeUndefined();
    expect(audit.schedule).toBeUndefined();
    expect(audit.scanner).toBeUndefined();
    expect(audit.second_last_report).toBeUndefined();
    expect(audit.slave).toBeUndefined();
    expect(audit.status).toEqual(AUDIT_STATUS.unknown);
    expect(audit.target).toBeUndefined();
    expect(audit.trend).toBeUndefined();
    expect(audit.usageType).toEqual(USAGE_TYPE.audit);
  });

  test('should parse hosts ordering', () => {
    // @ts-expect-error
    const audit = Audit.fromElement({hosts_ordering: 'foo'});
    expect(audit.hosts_ordering).toBeUndefined();

    const audit2 = Audit.fromElement({hosts_ordering: HOSTS_ORDERING_RANDOM});
    expect(audit2.hosts_ordering).toEqual(HOSTS_ORDERING_RANDOM);

    const audit3 = Audit.fromElement({hosts_ordering: HOSTS_ORDERING_REVERSE});
    expect(audit3.hosts_ordering).toEqual(HOSTS_ORDERING_REVERSE);

    const audit4 = Audit.fromElement({
      hosts_ordering: HOSTS_ORDERING_SEQUENTIAL,
    });
    expect(audit4.hosts_ordering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
  });

  test('should parse last report', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      last_report: {
        report: {
          _id: 'r1',
          scan_start: '2023-10-01T12:00:00Z',
          scan_end: '2023-10-01T12:05:00Z',
          timestamp: '2023-10-01T12:06:00Z',
          severity: 5.5,
          compliance_count: {
            yes: 1,
            no: 2,
            undefined: 3,
            incomplete: 4,
          },
        },
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.last_report?.id).toEqual('r1');
    expect(audit.last_report?.entityType).toEqual('report');
    expect(audit.last_report?.timestamp).toEqual(
      parseDate('2023-10-01T12:06:00Z'),
    );
    expect(audit.last_report?.scan_start).toEqual(
      parseDate('2023-10-01T12:00:00Z'),
    );
    expect(audit.last_report?.scan_end).toEqual(
      parseDate('2023-10-01T12:05:00Z'),
    );
    expect(audit.last_report?.severity).toEqual(5.5);
    expect(audit.last_report?.compliance_count?.yes).toEqual(1);
    expect(audit.last_report?.compliance_count?.no).toEqual(2);
    expect(audit.last_report?.compliance_count?.undefined).toEqual(3);
    expect(audit.last_report?.compliance_count?.incomplete).toEqual(4);
  });

  test('should parse current report', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      current_report: {
        report: {
          _id: 'r1',
        },
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.current_report?.id).toEqual('r1');
    expect(audit.current_report?.entityType).toEqual('report');
  });

  test('should parse config', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      config: {
        _id: 'c1',
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.config?.id).toEqual('c1');
    expect(audit.config?.entityType).toEqual('scanconfig');
  });

  test('should parse slave', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      slave: {
        _id: 's1',
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.slave?.id).toEqual('s1');
  });

  test('should parse target', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      target: {
        _id: 't1',
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.target?.id).toEqual('t1');
    expect(audit.target?.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      alert: [
        {
          _id: 'a1',
        },
        {
          _id: 'a2',
        },
      ],
    });
    expect(audit.id).toEqual('t1');
    expect(audit.alerts[0].id).toEqual('a1');
    expect(audit.alerts[0].entityType).toEqual('alert');
    expect(audit.alerts[1].id).toEqual('a2');
    expect(audit.alerts[1].entityType).toEqual('alert');
  });

  test('should parse scanner', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      scanner: {
        _id: 's1',
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.scanner?.id).toEqual('s1');
    expect(audit.scanner?.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      schedule: {
        _id: 's1',
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.schedule?.id).toEqual('s1');
    expect(audit.schedule?.entityType).toEqual('schedule');
  });

  test('should parse report counts', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      report_count: {
        __text: 13,
        finished: 14,
      },
    });
    expect(audit.id).toEqual('t1');
    expect(audit.report_count?.total).toEqual(13);
    expect(audit.report_count?.finished).toEqual(14);
  });

  test('should parse result counts', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      result_count: 666,
    });
    expect(audit.id).toEqual('t1');
    expect(audit.result_count).toEqual(666);
  });

  test('should parse schedule periods', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      schedule_periods: 666,
    });
    expect(audit.id).toEqual('t1');
    expect(audit.schedule_periods).toEqual(666);
  });

  test('should parse progress', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      progress: {},
    });
    expect(audit.progress).toEqual(0);

    const audit2 = Audit.fromElement({
      _id: 't1',
      progress: {
        __text: 66,
      },
    });
    expect(audit2.progress).toEqual(66);

    const audit3 = Audit.fromElement({
      _id: 't1',
      progress: 66,
    });
    expect(audit3.progress).toEqual(66);
  });

  test('should parse preferences', () => {
    const audit1 = Audit.fromElement({
      _id: 't1',
      preferences: {
        preference: [
          {
            scanner_name: 'in_assets',
            value: 'yes',
          },
          {
            scanner_name: 'assets_apply_overrides',
            value: 'yes',
          },
          {
            scanner_name: 'assets_min_qod',
            value: '70',
          },
          {
            scanner_name: 'auto_delete',
            value: 'keep',
          },
          {
            scanner_name: 'auto_delete_data',
            value: 0,
          },
          {
            scanner_name: 'max_hosts',
            value: '20',
          },
          {
            scanner_name: 'max_checks',
            value: '4',
          },
          {
            scanner_name: 'foo',
            value: 'bar',
            name: 'lorem',
          },
        ],
      },
    });
    expect(audit1.in_assets).toEqual(1);
    expect(audit1.apply_overrides).toEqual(1);
    expect(audit1.min_qod).toEqual(70);
    expect(audit1.auto_delete).toEqual('keep');
    expect(audit1.max_hosts).toEqual(20);
    expect(audit1.max_checks).toEqual(4);
    expect(audit1.preferences).toEqual({foo: {value: 'bar', name: 'lorem'}});

    const audit2 = Audit.fromElement({
      _id: 't1',
      preferences: {
        preference: [
          {
            scanner_name: 'in_assets',
            value: 'no',
          },
          {
            scanner_name: 'assets_apply_overrides',
            value: 'no',
          },
          {
            scanner_name: 'auto_delete',
            value: 'no',
          },
          {
            scanner_name: 'auto_delete_data',
            value: 3,
          },
        ],
      },
    });
    expect(audit2.in_assets).toEqual(0);
    expect(audit2.apply_overrides).toEqual(0);
    expect(audit2.auto_delete).toEqual('no');
    expect(audit2.auto_delete_data).toEqual(3);
  });

  test('should parse observers', () => {
    const audit = Audit.fromElement({
      observers: 'foo bar',
    });
    expect(audit.observers?.user).toEqual(['foo', 'bar']);

    const audit2 = Audit.fromElement({
      observers: {
        __text: 'anon nymous',
        role: ['lorem'],
        group: ['ipsum', 'dolor'],
      },
    });

    expect(audit2.observers?.user).toEqual(['anon', 'nymous']);
    expect(audit2.observers?.role).toEqual(['lorem']);
    expect(audit2.observers?.group).toEqual(['ipsum', 'dolor']);

    const audit3 = Audit.fromElement({
      observers: '',
    });
    expect(audit3.observers?.user).toBeUndefined();
    expect(audit3.observers?.role).toBeUndefined();
    expect(audit3.observers?.group).toBeUndefined();

    const audit4 = Audit.fromElement({
      observers: {
        __text: '',
      },
    });
    expect(audit4.observers?.user).toBeUndefined();
    expect(audit4.observers?.role).toBeUndefined();
    expect(audit4.observers?.group).toBeUndefined();
  });

  test('should parse alterable', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      alterable: 1,
    });
    expect(audit.id).toEqual('t1');
    expect(audit.alterable).toEqual(1);

    const audit2 = Audit.fromElement({
      _id: 't2',
      alterable: 0,
    });
    expect(audit2.id).toEqual('t2');
    expect(audit2.alterable).toEqual(0);
  });

  test('should parse average duration', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      average_duration: 123456,
    });
    expect(audit.id).toEqual('t1');
    expect(audit.average_duration).toEqual(parseDuration(123456));
  });

  test('should parse status', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      status: AUDIT_STATUS.running,
    });
    expect(audit.id).toEqual('t1');
    expect(audit.status).toEqual(AUDIT_STATUS.running);
  });

  test('should parse trend', () => {
    const audit = Audit.fromElement({
      _id: 't1',
      trend: 'up',
    });
    expect(audit.id).toEqual('t1');
    expect(audit.trend).toEqual('up');

    const audit2 = Audit.fromElement({
      _id: 't2',
      trend: 'down',
    });
    expect(audit2.id).toEqual('t2');
    expect(audit2.trend).toEqual('down');
  });

  test('should throw error for invalid usage type', () => {
    expect(() => {
      Audit.fromElement({
        _id: 't1',
        usage_type: 'invalid',
      });
    }).toThrow("Audit.parseElement: usage_type must be 'audit'");
  });
});

describe(`Audit Model methods tests`, () => {
  test('should use status for isActive', () => {
    const statusList = {
      [AUDIT_STATUS.running]: true,
      [AUDIT_STATUS.stoprequested]: true,
      [AUDIT_STATUS.deleterequested]: true,
      [AUDIT_STATUS.ultimatedeleterequested]: true,
      [AUDIT_STATUS.resumerequested]: true,
      [AUDIT_STATUS.requested]: true,
      [AUDIT_STATUS.stopped]: false,
      [AUDIT_STATUS.new]: false,
      [AUDIT_STATUS.interrupted]: false,
      [AUDIT_STATUS.container]: false,
      [AUDIT_STATUS.uploading]: false,
      [AUDIT_STATUS.done]: false,
      [AUDIT_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status: status as AuditStatus});
      expect(audit.isActive()).toEqual(exp);
    }
  });

  test('should use status for isRunning', () => {
    const statusList = {
      [AUDIT_STATUS.running]: true,
      [AUDIT_STATUS.stoprequested]: false,
      [AUDIT_STATUS.deleterequested]: false,
      [AUDIT_STATUS.ultimatedeleterequested]: false,
      [AUDIT_STATUS.resumerequested]: false,
      [AUDIT_STATUS.requested]: false,
      [AUDIT_STATUS.stopped]: false,
      [AUDIT_STATUS.new]: false,
      [AUDIT_STATUS.interrupted]: false,
      [AUDIT_STATUS.container]: false,
      [AUDIT_STATUS.uploading]: false,
      [AUDIT_STATUS.done]: false,
      [AUDIT_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status: status as AuditStatus});
      expect(audit.isRunning()).toEqual(exp);
    }
  });

  test('should use status for isStopped', () => {
    const statusList = {
      [AUDIT_STATUS.running]: false,
      [AUDIT_STATUS.stoprequested]: false,
      [AUDIT_STATUS.deleterequested]: false,
      [AUDIT_STATUS.ultimatedeleterequested]: false,
      [AUDIT_STATUS.resumerequested]: false,
      [AUDIT_STATUS.requested]: false,
      [AUDIT_STATUS.stopped]: true,
      [AUDIT_STATUS.new]: false,
      [AUDIT_STATUS.interrupted]: false,
      [AUDIT_STATUS.container]: false,
      [AUDIT_STATUS.uploading]: false,
      [AUDIT_STATUS.done]: false,
      [AUDIT_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status: status as AuditStatus});
      expect(audit.isStopped()).toEqual(exp);
    }
  });

  test('should use status for isInterrupted', () => {
    const statusList = {
      [AUDIT_STATUS.running]: false,
      [AUDIT_STATUS.stoprequested]: false,
      [AUDIT_STATUS.deleterequested]: false,
      [AUDIT_STATUS.ultimatedeleterequested]: false,
      [AUDIT_STATUS.resumerequested]: false,
      [AUDIT_STATUS.requested]: false,
      [AUDIT_STATUS.stopped]: false,
      [AUDIT_STATUS.new]: false,
      [AUDIT_STATUS.interrupted]: true,
      [AUDIT_STATUS.container]: false,
      [AUDIT_STATUS.uploading]: false,
      [AUDIT_STATUS.done]: false,
      [AUDIT_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status: status as AuditStatus});
      expect(audit.isInterrupted()).toEqual(exp);
    }
  });

  test('should use status for isNew', () => {
    const statusList = {
      [AUDIT_STATUS.running]: false,
      [AUDIT_STATUS.stoprequested]: false,
      [AUDIT_STATUS.deleterequested]: false,
      [AUDIT_STATUS.ultimatedeleterequested]: false,
      [AUDIT_STATUS.resumerequested]: false,
      [AUDIT_STATUS.requested]: false,
      [AUDIT_STATUS.stopped]: false,
      [AUDIT_STATUS.new]: true,
      [AUDIT_STATUS.interrupted]: false,
      [AUDIT_STATUS.container]: false,
      [AUDIT_STATUS.uploading]: false,
      [AUDIT_STATUS.done]: false,
      [AUDIT_STATUS.unknown]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status: status as AuditStatus});
      expect(audit.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let audit = Audit.fromElement({status: AUDIT_STATUS.new, alterable: 0});
    expect(audit.isChangeable()).toEqual(true);

    audit = Audit.fromElement({status: AUDIT_STATUS.done, alterable: 1});
    expect(audit.isChangeable()).toEqual(true);
  });
});
