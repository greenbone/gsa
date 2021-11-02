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
import ReportHost from '../host';
import {isDate} from 'gmp/models/date';

describe('ReportHost tests', () => {
  test('should initialize result counts', () => {
    const host1 = new ReportHost();

    expect(host1.result_counts).toBeDefined();
    expect(host1.result_counts.false_positive).toEqual(0);
    expect(host1.result_counts.high).toEqual(0);
    expect(host1.result_counts.info).toEqual(0);
    expect(host1.result_counts.log).toEqual(0);
    expect(host1.result_counts.warning).toEqual(0);
    expect(host1.result_counts.total).toEqual(0);

    const host2 = ReportHost.fromElement();

    expect(host2.result_counts).toBeDefined();
    expect(host2.result_counts.false_positive).toEqual(0);
    expect(host2.result_counts.high).toEqual(0);
    expect(host2.result_counts.info).toEqual(0);
    expect(host2.result_counts.log).toEqual(0);
    expect(host2.result_counts.warning).toEqual(0);
    expect(host2.result_counts.total).toEqual(0);
  });

  test('should initialize details', () => {
    const host1 = new ReportHost();

    expect(host1.details).toEqual({});

    const host2 = ReportHost.fromElement();

    expect(host2.details).toEqual({});
  });

  test('should initialize authSuccess', () => {
    const host1 = new ReportHost();

    expect(host1.authSuccess).toEqual({});

    const host2 = ReportHost.fromElement();

    expect(host2.authSuccess).toEqual({});
  });

  test('should parse asset', () => {
    const host = ReportHost.fromElement({
      asset: {
        _asset_id: 'a1',
      },
    });

    expect(host.asset).toBeDefined();
    expect(host.asset.id).toEqual('a1');
  });

  test('should parse port count', () => {
    const host1 = ReportHost.fromElement({
      port_count: {},
    });

    expect(host1.port_count).toEqual(0);

    const host2 = ReportHost.fromElement({
      port_count: {
        page: '2',
      },
    });

    expect(host2.port_count).toEqual(2);
  });

  test('should parse result counts', () => {
    const host1 = ReportHost.fromElement({
      result_count: {
        hole: {},
        warning: {},
        info: {},
        log: {},
        false_positive: {},
      },
    });

    expect(host1.result_counts.total).toEqual(0);
    expect(host1.result_counts.high).toEqual(0);
    expect(host1.result_counts.warning).toEqual(0);
    expect(host1.result_counts.info).toEqual(0);
    expect(host1.result_counts.log).toEqual(0);
    expect(host1.result_counts.false_positive).toEqual(0);

    expect(host1.result_count).toBeUndefined();

    const host2 = ReportHost.fromElement({
      result_count: {
        page: '6',
        hole: {
          page: '1',
        },
        warning: {
          page: '2',
        },
        info: {
          page: '3',
        },
        log: {
          page: '4',
        },
        false_positive: {
          page: '5',
        },
      },
    });

    expect(host2.result_counts.total).toEqual(6);
    expect(host2.result_counts.high).toEqual(1);
    expect(host2.result_counts.warning).toEqual(2);
    expect(host2.result_counts.info).toEqual(3);
    expect(host2.result_counts.log).toEqual(4);
    expect(host2.result_counts.false_positive).toEqual(5);

    expect(host2.result_count).toBeUndefined();
  });

  test('should parse start and end dates', () => {
    const host = ReportHost.fromElement({
      start: '2019-10-02T12:17:10+02:00',
      end: '2019-10-02T12:29:22+02:00',
    });

    expect(host.start).toBeDefined();
    expect(isDate(host.start)).toEqual(true);
    expect(host.end).toBeDefined();
    expect(isDate(host.end)).toEqual(true);
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
    expect(host.detail).toBeUndefined();
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

    expect(host.details.appsCount).toEqual(2);
    expect(host.detail).toBeUndefined();
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

    expect(host.detail).toBeUndefined();
    expect(host.hostname).toEqual('foo.bar');
    expect(host.details.best_os_cpe).toEqual('cpe:/foo/bar');
    expect(host.details.best_os_txt).toEqual('Foo OS');
    expect(host.details.distance).toEqual(2);
  });

  test('should parse ip as id', () => {
    const host = ReportHost.fromElement({
      ip: '1.2.3.4',
    });

    expect(host.ip).toEqual('1.2.3.4');
    expect(host.id).toEqual('1.2.3.4');
  });
});
