/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportApp from 'gmp/models/report/app';

describe('App tests', () => {
  test('should use defaults', () => {
    const app = new ReportApp();
    expect(app.id).toBeUndefined();
    expect(app.name).toBeUndefined();
    expect(app.severity).toBeUndefined();
    expect(app.hosts).toBeDefined();
    expect(app.hosts.hostsByIp).toEqual({});
    expect(app.hosts.count).toEqual(0);
    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);
  });

  test('should parse empty element', () => {
    const app = ReportApp.fromElement();
    expect(app.id).toBeUndefined();
    expect(app.name).toBeUndefined();
    expect(app.severity).toBeUndefined();
    expect(app.hosts).toBeDefined();
    expect(app.hosts.hostsByIp).toEqual({});
    expect(app.hosts.count).toEqual(0);
    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);
  });

  test('should parse id and name (cpe)', () => {
    const app = ReportApp.fromElement({value: 'foo'});
    expect(app.id).toEqual('foo');
    expect(app.name).toEqual('foo');
  });

  test('should parse severity', () => {
    const app = ReportApp.fromElement({severity: 5.5});
    expect(app.severity).toEqual(5.5);
  });

  test('should allow to add hosts', () => {
    const app = ReportApp.fromElement();
    expect(app.hosts).toBeDefined();
    expect(app.hosts.hostsByIp).toEqual({});
    expect(app.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    app.addHost(host);
    expect(app.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(app.hosts.count).toEqual(1);

    const host2 = {name: 'bar', ip: '1.2.3.4'};
    app.addHost(host2);
    expect(app.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(app.hosts.count).toEqual(1);

    const host3 = {name: 'bar', ip: '1.2.3.5'};
    app.addHost(host3);
    expect(app.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(app.hosts.hostsByIp['1.2.3.5']).toEqual(host3);
    expect(app.hosts.count).toEqual(2);
  });

  test('should allow to add occurrence with details', () => {
    const app = ReportApp.fromElement();
    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);

    app.addOccurrence(5);
    expect(app.occurrences.details).toEqual(5);
    expect(app.occurrences.total).toEqual(5);
    expect(app.occurrences.withoutDetails).toEqual(0);
  });

  test('should allow to add occurrence without details', () => {
    const app = ReportApp.fromElement();

    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);

    app.addOccurrence();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(1);
    expect(app.occurrences.withoutDetails).toEqual(1);
  });
});
