/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportCve from 'gmp/models/report/cve';

describe('ReportCve tests', () => {
  test('should use defaults', () => {
    const cve = new ReportCve();
    expect(cve.cves).toEqual([]);
    expect(cve.id).toBeUndefined();
    expect(cve.nvtName).toBeUndefined();
    expect(cve.severity).toBeUndefined();
    expect(cve.hosts).toBeDefined();
    expect(cve.hosts.hostsByIp).toEqual({});
    expect(cve.hosts.count).toEqual(0);
    expect(cve.occurrences).toEqual(0);
  });

  test('should parse empty element', () => {
    const cve = ReportCve.fromElement();
    expect(cve.cves).toEqual([]);
    expect(cve.id).toBeUndefined();
    expect(cve.nvtName).toBeUndefined();
    expect(cve.severity).toBeUndefined();
    expect(cve.hosts).toBeDefined();
    expect(cve.hosts.hostsByIp).toEqual({});
    expect(cve.hosts.count).toEqual(0);
    expect(cve.occurrences).toEqual(0);
  });

  test('should parse cves', () => {
    const cve = ReportCve.fromElement({
      nvt: {
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
      },
    });
    expect(cve.cves.length).toEqual(2);
    expect(cve.cves[0]).toEqual('1');
    expect(cve.cves[1]).toEqual('2');
  });

  test('should parse oid/id', () => {
    const cve = ReportCve.fromElement({
      nvt: {
        _oid: 'c1',
      },
    });
    expect(cve.id).toEqual('c1');
  });

  test('should parse nvtName', () => {
    const cve = ReportCve.fromElement({
      nvt: {_oid: '1.2.3', name: 'Foo'},
    });
    expect(cve.nvtName).toEqual('Foo');
  });

  test('should add hosts', () => {
    const cve = ReportCve.fromElement();
    expect(cve.hosts).toBeDefined();
    expect(cve.hosts.hostsByIp).toEqual({});
    expect(cve.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    cve.addHost(host);
    expect(cve.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(cve.hosts.count).toEqual(1);

    const host2 = {name: 'bar', ip: '1.2.3.5'};
    cve.addHost(host2);
    expect(cve.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(cve.hosts.hostsByIp['1.2.3.5']).toEqual(host2);
    expect(cve.hosts.count).toEqual(2);

    const host3 = {name: 'foo', ip: '1.2.3.4'};
    cve.addHost(host3);
    expect(cve.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(cve.hosts.hostsByIp['1.2.3.5']).toEqual(host2);
    expect(cve.hosts.count).toEqual(2);
  });

  test('should add result', () => {
    const cve = ReportCve.fromElement();
    expect(cve.occurrences).toEqual(0);
    expect(cve.severity).toBeUndefined();

    cve.addResult({severity: 1.0});
    expect(cve.occurrences).toEqual(1);
    expect(cve.severity).toEqual(1.0);

    cve.addResult({severity: 9.0});
    expect(cve.occurrences).toEqual(2);
    expect(cve.severity).toEqual(9.0);

    cve.addResult({severity: 5.0});
    expect(cve.occurrences).toEqual(3);
    expect(cve.severity).toEqual(9.0);
  });
});
