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

import 'core-js/features/object/entries';

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
});
