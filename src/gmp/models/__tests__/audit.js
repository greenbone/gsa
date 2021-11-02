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

import Audit, {
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUDIT_STATUS,
} from 'gmp/models/audit';
import {testModel} from '../testing';

describe('Audit model tests', () => {
  testModel(Audit, 'audit', {testIsActive: false});

  test('should parse undefined hosts_ordering', () => {
    const obj = {hosts_ordering: undefined};
    const audit = Audit.fromElement(obj);
    expect(audit.hosts_ordering).toBeUndefined();
  });

  test('should parse unknown hosts_ordering as undefined', () => {
    const obj = {hosts_ordering: 'foo'};
    const audit = Audit.fromElement(obj);
    expect(audit.hosts_ordering).toBeUndefined();
  });

  test('should parse known hosts_ordering', () => {
    let obj = {hosts_ordering: HOSTS_ORDERING_RANDOM};
    let audit = Audit.fromElement(obj);
    expect(audit.hosts_ordering).toEqual(HOSTS_ORDERING_RANDOM);

    obj = {hosts_ordering: HOSTS_ORDERING_REVERSE};
    audit = Audit.fromElement(obj);
    expect(audit.hosts_ordering).toEqual(HOSTS_ORDERING_REVERSE);

    obj = {hosts_ordering: HOSTS_ORDERING_SEQUENTIAL};
    audit = Audit.fromElement(obj);
    expect(audit.hosts_ordering).toEqual(HOSTS_ORDERING_SEQUENTIAL);
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
            scanner_name: 'source_iface',
            value: 'eth0',
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
    expect(audit1.source_iface).toEqual('eth0');
    expect(audit1.preferences).toEqual({foo: {value: 'bar', name: 'lorem'}});
    expect(audit2.in_assets).toEqual(0);
    expect(audit2.apply_overrides).toEqual(0);
    expect(audit2.auto_delete).toEqual('no');
    expect(audit2.auto_delete_data).toEqual(3);
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

  test('should be changeable if alterable or new', () => {
    let audit = Audit.fromElement({status: AUDIT_STATUS.new, alterable: '0'});
    expect(audit.isChangeable()).toEqual(true);

    audit = Audit.fromElement({status: AUDIT_STATUS.done, alterable: '1'});
    expect(audit.isChangeable()).toEqual(true);
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
