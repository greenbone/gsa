/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {
  VulnsHostsDisplay,
  VulnsHostsTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsHostsDisplay';

vi.mock('web/pages/vulns/dashboard/VulnsLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnsHostsLoader: ({children}) =>
    children({data: {groups: [], total: 0}, isLoading: false}),
}));

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, title}) => (
    <div data-testid="mock-data-display">
      {title?.({data})}
      {typeof children === 'function'
        ? children({width: 400, height: 300, data, svgRef: {current: null}})
        : children}
    </div>
  ),
}));

vi.mock('web/components/chart/Bar', () => ({
  default: ({data}) => (
    <div data-testid="mock-bar-chart">bars:{data?.length || 0}</div>
  ),
}));

describe('VulnsHostsDisplay', () => {
  test('should export VulnsHostsDisplay', () => {
    expect(VulnsHostsDisplay).toBeDefined();
    expect(typeof VulnsHostsDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsHostsDisplay.displayId).toBe('vuln-by-hosts');
  });
});

describe('VulnsHostsTableDisplay', () => {
  test('should export VulnsHostsTableDisplay', () => {
    expect(VulnsHostsTableDisplay).toBeDefined();
    expect(typeof VulnsHostsTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsHostsTableDisplay.displayId).toBe('vuln-by-hosts-table');
  });

  test('should have displayName', () => {
    expect(VulnsHostsTableDisplay.displayName).toContain(
      'VulnsHostsTableDisplay',
    );
  });
});
