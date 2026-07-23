/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import BaseFilter from 'gmp/models/filter/base-filter';
import {
  VULNS_DASHBOARD_ID,
  VULNS_DISPLAYS,
  default as VulnerabilitiesDashboard,
} from 'web/pages/vulns/dashboard';

const mockDashboard = testing.fn((_props: unknown) => (
  <div data-testid="mock-dashboard" />
));

vi.mock('web/components/dashboard/Dashboard', () => ({
  default: (props: unknown) => mockDashboard(props),
}));

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

  test('should render Dashboard with the correct configuration', () => {
    const onFilterChanged = testing.fn();
    const filter = BaseFilter.fromString('foo=bar');
    const {render} = rendererWith();
    render(
      <VulnerabilitiesDashboard
        filter={filter}
        onFilterChanged={onFilterChanged}
      />,
    );

    expect(mockDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: VULNS_DASHBOARD_ID,
        filter,
        onFilterChanged,
        permittedDisplays: VULNS_DISPLAYS,
        defaultDisplays: [['vuln-by-cvss', 'vuln-by-severity-class']],
      }),
    );
  });
});
