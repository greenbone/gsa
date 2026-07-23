/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  VulnsCvssDisplay,
  VulnsCvssTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsCvssDisplay';

vi.mock('web/pages/vulns/dashboard/VulnsLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnsSeverityLoader: ({children}) =>
    children({data: {total: 42}, isLoading: false}),
}));

vi.mock('web/components/dashboard/display/cvss/CvssDisplay', () => ({
  default: ({title, data}) => (
    <div data-testid="mock-cvss-display">{title?.({data})}</div>
  ),
}));

vi.mock('web/components/dashboard/display/cvss/CvssTableDisplay', () => ({
  default: ({title, data}) => (
    <div data-testid="mock-cvss-table-display">{title?.({data})}</div>
  ),
}));

describe('VulnsCvssDisplay', () => {
  test('should export VulnsCvssDisplay', () => {
    expect(VulnsCvssDisplay).toBeDefined();
    expect(typeof VulnsCvssDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsCvssDisplay.displayId).toBe('vuln-by-cvss');
  });

  test('should have displayName', () => {
    expect(VulnsCvssDisplay.displayName).toContain('VulnsCvssDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsCvssDisplay.displayId);
    expect(registered?.component).toBe(VulnsCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: Vulnerabilities by CVSS');
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnsCvssDisplay />);
    screen.getByText(/Total: 42/);
  });
});

describe('VulnsCvssTableDisplay', () => {
  test('should export VulnsCvssTableDisplay', () => {
    expect(VulnsCvssTableDisplay).toBeDefined();
    expect(typeof VulnsCvssTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsCvssTableDisplay.displayId).toBe('vuln-by-cvss-table');
  });

  test('should have displayName', () => {
    expect(VulnsCvssTableDisplay.displayName).toContain(
      'VulnsCvssTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsCvssTableDisplay.displayId);
    expect(registered?.component).toBe(VulnsCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: Vulnerabilities by CVSS');
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnsCvssTableDisplay />);
    screen.getByText(/Total: 42/);
  });
});
