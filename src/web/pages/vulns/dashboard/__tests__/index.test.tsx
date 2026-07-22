/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  VULNS_DASHBOARD_ID,
  VULNS_DISPLAYS,
  default as VulnerabilitiesDashboard,
} from 'web/pages/vulns/dashboard';

describe('VulnerabilitiesDashboard index', () => {
  test('should export dashboard ID', () => {
    expect(VULNS_DASHBOARD_ID).toBe('43690dcb-3174-4d84-aa88-58c1936c7f5c');
  });

  test('should export display IDs', () => {
    expect(VULNS_DISPLAYS).toContain('vuln-by-cvss');
    expect(VULNS_DISPLAYS).toContain('vuln-by-hosts');
    expect(VULNS_DISPLAYS).toContain('vuln-by-severity-class');
    expect(VULNS_DISPLAYS).toContain('vuln-by-cvss-table');
    expect(VULNS_DISPLAYS).toContain('vuln-by-severity-class-table');
    expect(VULNS_DISPLAYS).toContain('vuln-by-hosts-table');
  });

  test('should export VulnerabilitiesDashboard as default', () => {
    expect(VulnerabilitiesDashboard).toBeDefined();
    expect(typeof VulnerabilitiesDashboard).toBe('function');
  });
});
