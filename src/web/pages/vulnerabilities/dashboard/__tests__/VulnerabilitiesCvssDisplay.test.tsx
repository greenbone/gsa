/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  VulnerabilitiesCvssDisplay,
  VulnerabilitiesCvssTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesCvssDisplay';

vi.mock('web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnerabilitiesSeverityLoader: ({children}) =>
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

describe('VulnerabilitiesCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesCvssDisplay).toBeDefined();
    expect(typeof VulnerabilitiesCvssDisplay).toBe('function');
    expect(VulnerabilitiesCvssDisplay.displayId).toBe('vuln-by-cvss');
    expect(VulnerabilitiesCvssDisplay.displayName).toContain(
      'VulnerabilitiesCvssDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnerabilitiesCvssDisplay.displayId);
    expect(registered?.component).toBe(VulnerabilitiesCvssDisplay);
    expect(String(registered?.title)).toBe('Chart: Vulnerabilities by CVSS');
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnerabilitiesCvssDisplay />);
    screen.getByText(/Total: 42/);
  });
});

describe('VulnerabilitiesCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesCvssTableDisplay).toBeDefined();
    expect(typeof VulnerabilitiesCvssTableDisplay).toBe('function');
    expect(VulnerabilitiesCvssTableDisplay.displayId).toBe(
      'vuln-by-cvss-table',
    );
    expect(VulnerabilitiesCvssTableDisplay.displayName).toContain(
      'VulnerabilitiesCvssTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnerabilitiesCvssTableDisplay.displayId);
    expect(registered?.component).toBe(VulnerabilitiesCvssTableDisplay);
    expect(String(registered?.title)).toBe('Table: Vulnerabilities by CVSS');
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnerabilitiesCvssTableDisplay />);
    screen.getByText(/Total: 42/);
  });
});
