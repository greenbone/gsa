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

import Model from 'gmp/model';
import Audit, {AUDIT_STATUS, HYPERION_AUDIT_STATUS} from 'gmp/models/audit';
import Policy from 'gmp/models/policy';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import {testModel} from 'gmp/models/testing';

describe('Audit model parseObject tests', () => {
  testModel(Audit, 'audit', {testIsActive: false});

  test('should parse preferences', () => {
    const audit1 = Audit.fromObject({
      id: 'a1',
      preferences: {
        createAssets: true,
        createAssetsApplyOverrides: true,
        createAssetsMinQod: 70,
        autoDeleteReports: 0,
        maxConcurrentHosts: 20,
        maxConcurrentNvts: 4,
      },
    });
    const audit2 = Audit.fromObject({
      id: 'a1',
      preferences: {
        createAssets: false,
        createAssetsApplyOverrides: false,
        autoDeleteReports: 3,
      },
    });

    expect(audit1.preferences.createAssets).toEqual(true);
    expect(audit1.preferences.createAssetsApplyOverrides).toEqual(true);
    expect(audit1.preferences.createAssetsMinQod).toEqual(70);
    expect(audit1.preferences.maxConcurrentHosts).toEqual(20);
    expect(audit1.preferences.maxConcurrentNvts).toEqual(4);
    expect(audit2.preferences.createAssets).toEqual(false);
    expect(audit2.preferences.createAssetsApplyOverrides).toEqual(false);
    expect(audit2.preferences.autoDeleteReports).toEqual(3);
  });

  test('should parse audit progress', () => {
    const obj = {progress: 13};
    const obj2 = {};
    const obj3 = {progress: -1};
    const obj4 = {progress: null};

    const audit = Audit.fromObject(obj);
    const audit2 = Audit.fromObject(obj2);
    const audit3 = Audit.fromObject(obj3);
    const audit4 = Audit.fromObject(obj4);

    expect(audit.progress).toEqual(13);
    expect(audit2.progress).toEqual(0);
    expect(audit3.progress).toEqual(-1);
    expect(audit4.progress).toEqual(0);
  });

  test('should parse reports', () => {
    const obj = {
      reports: {
        lastReport: {
          id: '1234',
          complianceCount: {
            yes: 3,
            no: 2,
            incomplete: 4,
          },
        },
        currentReport: {
          id: '5678',
        },
        counts: {
          total: 2,
          finished: 1,
        },
      },
    };

    const audit = Audit.fromObject(obj);
    const {reports} = audit;

    const {lastReport, currentReport, counts} = reports;

    expect(lastReport.id).toEqual('1234');
    expect(lastReport.complianceCount).toEqual({
      yes: 3,
      no: 2,
      incomplete: 4,
    });
    expect(lastReport.entityType).toEqual('report');

    expect(currentReport.id).toEqual('5678');
    expect(currentReport.entityType).toEqual('report');
    expect(counts).toEqual({total: 2, finished: 1});
  });
  test('should parse policy', () => {
    const obj = {
      id: 't1',
      policy: {
        id: 'p1',
      },
    };

    const audit = Audit.fromObject(obj);

    expect(audit.id).toEqual('t1');

    expect(audit.policy).toBeInstanceOf(Policy);
    expect(audit.policy.id).toEqual('p1');
    expect(audit.policy.entityType).toEqual('policy');
  });
  test('should parse target', () => {
    const obj = {
      id: 't1',
      target: {
        id: 't1',
      },
    };

    const audit = Audit.fromObject(obj);

    expect(audit.id).toEqual('t1');

    expect(audit.target).toBeInstanceOf(Model);
    expect(audit.target.id).toEqual('t1');
    expect(audit.target.entityType).toEqual('target');
  });

  test('should parse alerts', () => {
    const obj = {
      id: 't1',
      alerts: [
        {
          id: 'a1',
        },
        {
          id: 'a2',
        },
      ],
    };

    const audit = Audit.fromObject(obj);

    expect(audit.id).toEqual('t1');

    expect(audit.alerts[0]).toBeInstanceOf(Model);
    expect(audit.alerts[0].id).toEqual('a1');
    expect(audit.alerts[0].entityType).toEqual('alert');
    expect(audit.alerts[1]).toBeInstanceOf(Model);
    expect(audit.alerts[1].entityType).toEqual('alert');
    expect(audit.alerts[1].id).toEqual('a2');
  });

  test('should parse scanner', () => {
    const obj = {
      id: 't1',
      scanner: {
        id: 's1',
      },
    };

    const audit = Audit.fromObject(obj);

    expect(audit.id).toEqual('t1');

    expect(audit.scanner).toBeInstanceOf(Scanner);
    expect(audit.scanner.id).toEqual('s1');
    expect(audit.scanner.entityType).toEqual('scanner');
  });

  test('should parse schedule', () => {
    const obj = {
      id: 't1',
      schedule: {
        id: 's1',
      },
    };

    const audit = Audit.fromObject(obj);

    expect(audit.id).toEqual('t1');

    expect(audit.schedule).toBeInstanceOf(Schedule);
    expect(audit.schedule.id).toEqual('s1');
    expect(audit.schedule.entityType).toEqual('schedule');
  });
});

describe('Audit model parseElement tests', () => {
  testModel(Audit, 'audit', {testIsActive: false});

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

    expect(audit1.in_assets).toEqual(1);
    expect(audit1.apply_overrides).toEqual(1);
    expect(audit1.min_qod).toEqual(70);
    expect(audit1.auto_delete).toEqual('keep');
    expect(audit1.max_hosts).toEqual(20);
    expect(audit1.max_checks).toEqual(4);
    expect(audit1.preferences).toEqual({foo: {value: 'bar', name: 'lorem'}});
    expect(audit2.in_assets).toEqual(0);
    expect(audit2.apply_overrides).toEqual(0);
    expect(audit2.auto_delete).toEqual('no');
    expect(audit2.auto_delete_data).toEqual(3);
  });

  test('should parse observer strings', () => {
    const audit = Audit.fromElement({
      observers: 'foo bar',
    });

    const {observers} = audit;
    expect(observers.user).toEqual(['foo', 'bar']);
  });
  test('should parse all observers types', () => {
    const audit = Audit.fromElement({
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const {observers} = audit;

    expect(observers.user).toEqual(['anon', 'nymous']);
    expect(observers.role).toEqual([{name: 'lorem'}]);
    expect(observers.group).toEqual([{name: 'ipsum'}, {name: 'dolor'}]);
  });
});

describe(`Audit Model methods parseObject tests`, () => {
  test('should be a container if targetid is not set', () => {
    const audit1 = Audit.fromObject({});
    const audit2 = Audit.fromObject({target: {id: 'foo'}});

    expect(audit1.isContainer()).toEqual(true);
    expect(audit2.isContainer()).toEqual(false);
  });

  test('should use status for isActive', () => {
    const statusList = {
      [HYPERION_AUDIT_STATUS.running]: true,
      [HYPERION_AUDIT_STATUS.stoprequested]: true,
      [HYPERION_AUDIT_STATUS.deleterequested]: true,
      [HYPERION_AUDIT_STATUS.ultimatedeleterequested]: true,
      [HYPERION_AUDIT_STATUS.resumerequested]: true,
      [HYPERION_AUDIT_STATUS.requested]: true,
      [HYPERION_AUDIT_STATUS.stopped]: false,
      [HYPERION_AUDIT_STATUS.new]: false,
      [HYPERION_AUDIT_STATUS.interrupted]: false,
      [HYPERION_AUDIT_STATUS.container]: false,
      [HYPERION_AUDIT_STATUS.uploading]: false,
      [HYPERION_AUDIT_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromObject({status});
      expect(audit.isActive()).toEqual(exp);
    }
  });

  test('should use status for isRunning', () => {
    const statusList = {
      [HYPERION_AUDIT_STATUS.running]: true,
      [HYPERION_AUDIT_STATUS.stoprequested]: false,
      [HYPERION_AUDIT_STATUS.deleterequested]: false,
      [HYPERION_AUDIT_STATUS.ultimatedeleterequested]: false,
      [HYPERION_AUDIT_STATUS.resumerequested]: false,
      [HYPERION_AUDIT_STATUS.requested]: false,
      [HYPERION_AUDIT_STATUS.stopped]: false,
      [HYPERION_AUDIT_STATUS.new]: false,
      [HYPERION_AUDIT_STATUS.interrupted]: false,
      [HYPERION_AUDIT_STATUS.container]: false,
      [HYPERION_AUDIT_STATUS.uploading]: false,
      [HYPERION_AUDIT_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromObject({status});
      expect(audit.isRunning()).toEqual(exp);
    }
  });

  test('should use status for isStopped', () => {
    const statusList = {
      [HYPERION_AUDIT_STATUS.running]: false,
      [HYPERION_AUDIT_STATUS.stoprequested]: false,
      [HYPERION_AUDIT_STATUS.deleterequested]: false,
      [HYPERION_AUDIT_STATUS.ultimatedeleterequested]: false,
      [HYPERION_AUDIT_STATUS.resumerequested]: false,
      [HYPERION_AUDIT_STATUS.requested]: false,
      [HYPERION_AUDIT_STATUS.stopped]: true,
      [HYPERION_AUDIT_STATUS.new]: false,
      [HYPERION_AUDIT_STATUS.interrupted]: false,
      [HYPERION_AUDIT_STATUS.container]: false,
      [HYPERION_AUDIT_STATUS.uploading]: false,
      [HYPERION_AUDIT_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromObject({status});
      expect(audit.isStopped()).toEqual(exp);
    }
  });

  test('should use status for isInterrupted', () => {
    const statusList = {
      [HYPERION_AUDIT_STATUS.running]: false,
      [HYPERION_AUDIT_STATUS.stoprequested]: false,
      [HYPERION_AUDIT_STATUS.deleterequested]: false,
      [HYPERION_AUDIT_STATUS.ultimatedeleterequested]: false,
      [HYPERION_AUDIT_STATUS.resumerequested]: false,
      [HYPERION_AUDIT_STATUS.requested]: false,
      [HYPERION_AUDIT_STATUS.stopped]: false,
      [HYPERION_AUDIT_STATUS.new]: false,
      [HYPERION_AUDIT_STATUS.interrupted]: true,
      [HYPERION_AUDIT_STATUS.container]: false,
      [HYPERION_AUDIT_STATUS.uploading]: false,
      [HYPERION_AUDIT_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromObject({status});
      expect(audit.isInterrupted()).toEqual(exp);
    }
  });

  test('should use status for isNew', () => {
    const statusList = {
      [HYPERION_AUDIT_STATUS.running]: false,
      [HYPERION_AUDIT_STATUS.stoprequested]: false,
      [HYPERION_AUDIT_STATUS.deleterequested]: false,
      [HYPERION_AUDIT_STATUS.ultimatedeleterequested]: false,
      [HYPERION_AUDIT_STATUS.resumerequested]: false,
      [HYPERION_AUDIT_STATUS.requested]: false,
      [HYPERION_AUDIT_STATUS.stopped]: false,
      [HYPERION_AUDIT_STATUS.new]: true,
      [HYPERION_AUDIT_STATUS.interrupted]: false,
      [HYPERION_AUDIT_STATUS.container]: false,
      [HYPERION_AUDIT_STATUS.uploading]: false,
      [HYPERION_AUDIT_STATUS.done]: false,
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromObject({status});
      expect(audit.isNew()).toEqual(exp);
    }
  });

  test('should be changeable if alterable or new', () => {
    let audit = Audit.fromObject({
      status: HYPERION_AUDIT_STATUS.new,
      alterable: false,
    });
    expect(audit.isChangeable()).toEqual(true);

    audit = Audit.fromObject({
      status: HYPERION_AUDIT_STATUS.done,
      alterable: true,
    });
    expect(audit.isChangeable()).toEqual(true);
  });
});

describe(`Audit Model methods parseElement tests`, () => {
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
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status});
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
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status});
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
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status});
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
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status});
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
    };

    for (const [status, exp] of Object.entries(statusList)) {
      const audit = Audit.fromElement({status});
      expect(audit.isNew()).toEqual(exp);
    }
  });

  // isChangeable is only used with objects
});
