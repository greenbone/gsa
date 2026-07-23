/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsSeverityClassDisplay';

vi.mock('web/pages/vulns/dashboard/VulnsLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnsSeverityLoader: ({children}) =>
    children({data: {total: 17}, isLoading: false}),
}));

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassDisplay',
  () => ({
    default: ({title, data}) => (
      <div data-testid="mock-severity-display">{title?.({data})}</div>
    ),
  }),
);

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassTableDisplay',
  () => ({
    default: ({title, data}) => (
      <div data-testid="mock-severity-table-display">{title?.({data})}</div>
    ),
  }),
);

describe('VulnsSeverityDisplay', () => {
  test('should export VulnsSeverityDisplay', () => {
    expect(VulnsSeverityDisplay).toBeDefined();
    expect(typeof VulnsSeverityDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsSeverityDisplay.displayId).toBe('vuln-by-severity-class');
  });

  test('should have displayName', () => {
    expect(VulnsSeverityDisplay.displayName).toContain('VulnsSeverityDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsSeverityDisplay.displayId);
    expect(registered?.component).toBe(VulnsSeverityDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Vulnerabilities by Severity Class',
    );
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnsSeverityDisplay />);
    screen.getByText(/Total: 17/);
  });
});

describe('VulnsSeverityTableDisplay', () => {
  test('should export VulnsSeverityTableDisplay', () => {
    expect(VulnsSeverityTableDisplay).toBeDefined();
    expect(typeof VulnsSeverityTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsSeverityTableDisplay.displayId).toBe(
      'vuln-by-severity-class-table',
    );
  });

  test('should have displayName', () => {
    expect(VulnsSeverityTableDisplay.displayName).toContain(
      'VulnsSeverityTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsSeverityTableDisplay.displayId);
    expect(registered?.component).toBe(VulnsSeverityTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Vulnerabilities by Severity Class',
    );
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnsSeverityTableDisplay />);
    screen.getByText(/Total: 17/);
  });
});
