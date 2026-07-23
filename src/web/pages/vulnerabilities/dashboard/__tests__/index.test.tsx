/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  VULNERABILITIES_DASHBOARD_ID,
  VULNERABILITIES_DISPLAYS,
  default as VulnerabilitiesDashboard,
} from 'web/pages/vulnerabilities/dashboard';

const mockDashboard = testing.fn((_props: unknown) => (
  <div data-testid="mock-dashboard" />
));

vi.mock('web/components/dashboard/Dashboard', () => ({
  default: (props: unknown) => mockDashboard(props),
}));

describe('VulnerabilitiesDashboard index', () => {
  test('should export dashboard ID', () => {
    expect(VULNERABILITIES_DASHBOARD_ID).toBe(
      '43690dcb-3174-4d84-aa88-58c1936c7f5c',
    );
  });

  test('should export display IDs', () => {
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-cvss');
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-hosts');
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-severity-class');
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-cvss-table');
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-severity-class-table');
    expect(VULNERABILITIES_DISPLAYS).toContain('vuln-by-hosts-table');
  });

  test('should export VulnerabilitiesDashboard as default', () => {
    expect(VulnerabilitiesDashboard).toBeDefined();
    expect(typeof VulnerabilitiesDashboard).toBe('function');
  });

  test('should render Dashboard with the correct configuration', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('foo=bar');
    const {render} = rendererWith();
    render(
      <VulnerabilitiesDashboard
        filter={filter}
        onFilterChanged={onFilterChanged}
      />,
    );

    expect(mockDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: VULNERABILITIES_DASHBOARD_ID,
        filter,
        onFilterChanged,
        permittedDisplays: VULNERABILITIES_DISPLAYS,
        defaultDisplays: [['vuln-by-cvss', 'vuln-by-severity-class']],
      }),
    );
  });
});
