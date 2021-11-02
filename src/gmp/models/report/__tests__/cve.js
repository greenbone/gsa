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
import ReportCve from '../cve';

describe('ReportCve tests', () => {
  test('should initialize hosts', () => {
    const cve1 = new ReportCve();

    expect(cve1.hosts).toBeDefined();
    expect(cve1.hosts.hostsByIp).toBeDefined();
    expect(cve1.hosts.count).toEqual(0);

    const cve2 = ReportCve.fromElement();

    expect(cve2.hosts).toBeDefined();
    expect(cve2.hosts.hostsByIp).toBeDefined();
    expect(cve2.hosts.count).toEqual(0);
  });

  test('should initialize occurrences', () => {
    const cve1 = new ReportCve();

    expect(cve1.occurrences).toEqual(0);

    const cve2 = ReportCve.fromElement();

    expect(cve2.occurrences).toEqual(0);
  });

  test('should parse cves', () => {
    const reportcve1 = ReportCve.fromElement({});
    const elem = {
      refs: {
        ref: [
          {
            _id: '1',
            _type: 'cve',
          },
          {
            _id: '2',
            _type: 'cve_id',
          },
        ],
      },
    };
    const reportcve2 = ReportCve.fromElement(elem);

    expect(reportcve1.cves.length).toEqual(0);
    expect(reportcve2.cves.length).toEqual(2);
    expect(reportcve2.cves[0]).toEqual('1');
    expect(reportcve2.cves[1]).toEqual('2');
  });

  test('should parse oid/id', () => {
    const reportcve = ReportCve.fromElement({
      _oid: 'c1',
    });
    expect(reportcve.id).toEqual('c1');
  });

  test('should add hosts', () => {
    const reportcve = ReportCve.fromElement();

    expect(reportcve.hosts).toBeDefined();
    expect(reportcve.hosts.hostsByIp).toEqual({});
    expect(reportcve.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    reportcve.addHost(host);

    expect(reportcve.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(reportcve.hosts.count).toEqual(1);
  });

  test('should add result', () => {
    const reportcve = ReportCve.fromElement();

    expect(reportcve.occurrences).toEqual(0);
    expect(reportcve.severity).toBeUndefined();

    reportcve.addResult({severity: '1.0'});

    expect(reportcve.occurrences).toEqual(1);
    expect(reportcve.severity).toEqual(1.0);

    reportcve.addResult({severity: '9.0'});

    expect(reportcve.occurrences).toEqual(2);
    expect(reportcve.severity).toEqual(9.0);

    reportcve.addResult({severity: '5.0'});

    expect(reportcve.occurrences).toEqual(3);
    expect(reportcve.severity).toEqual(9.0);
  });

  test('should parse nvtName', () => {
    const reportcve = ReportCve.fromElement({
      nvt: {_oid: '1.2.3', name: 'Foo'},
    });
    expect(reportcve.nvtName).toEqual('Foo');
  });
});
