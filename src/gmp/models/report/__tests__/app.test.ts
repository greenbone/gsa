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
    expect(app.hosts.count).toEqual(0);
    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.total).toEqual(0);
  });

  test('should parse empty element', () => {
    const app = ReportApp.fromElement();
    expect(app.id).toBeUndefined();
    expect(app.name).toBeUndefined();
    expect(app.severity).toBeUndefined();
    expect(app.hosts).toBeDefined();
    expect(app.hosts.count).toEqual(0);
    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.total).toEqual(0);
  });

  test('should parse id and name (cpe)', () => {
    const app = ReportApp.fromElement({name: 'foo'});
    expect(app.id).toEqual('foo');
    expect(app.name).toEqual('foo');
  });

  test('should parse severity', () => {
    const app = ReportApp.fromElement({severity: 5.5});
    expect(app.severity).toEqual(5.5);
  });

  test('should parse hosts_count and occurrences', () => {
    const app = ReportApp.fromElement({
      name: 'cpe:/app',
      hosts_count: 10,
      occurrences: 25,
    });
    expect(app.hosts.count).toEqual(10);
    expect(app.occurrences.total).toEqual(25);
  });

  test('should handle undefined hosts_count and occurrences', () => {
    const app = ReportApp.fromElement({name: 'cpe:/app'});
    expect(app.hosts.count).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
  });
});
