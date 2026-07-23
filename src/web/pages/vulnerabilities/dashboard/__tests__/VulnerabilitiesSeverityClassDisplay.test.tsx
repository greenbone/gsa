/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  VulnerabilitiesSeverityDisplay,
  VulnerabilitiesSeverityTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesSeverityClassDisplay';

vi.mock('web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnerabilitiesSeverityLoader: ({children}) =>
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

describe('VulnerabilitiesSeverityDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesSeverityDisplay).toBeDefined();
    expect(typeof VulnerabilitiesSeverityDisplay).toBe('function');
    expect(VulnerabilitiesSeverityDisplay.displayId).toBe(
      'vuln-by-severity-class',
    );
    expect(VulnerabilitiesSeverityDisplay.displayName).toContain(
      'VulnerabilitiesSeverityDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnerabilitiesSeverityDisplay.displayId);
    expect(registered?.component).toBe(VulnerabilitiesSeverityDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Vulnerabilities by Severity Class',
    );
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnerabilitiesSeverityDisplay />);
    screen.getByText(/Total: 17/);
  });
});

describe('VulnerabilitiesSeverityTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesSeverityTableDisplay).toBeDefined();
    expect(typeof VulnerabilitiesSeverityTableDisplay).toBe('function');
    expect(VulnerabilitiesSeverityTableDisplay.displayId).toBe(
      'vuln-by-severity-class-table',
    );
    expect(VulnerabilitiesSeverityTableDisplay.displayName).toContain(
      'VulnerabilitiesSeverityTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      VulnerabilitiesSeverityTableDisplay.displayId,
    );
    expect(registered?.component).toBe(VulnerabilitiesSeverityTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Vulnerabilities by Severity Class',
    );
  });

  test('should render the total vulnerabilities count in the title', () => {
    const {render} = rendererWith();
    render(<VulnerabilitiesSeverityTableDisplay />);
    screen.getByText(/Total: 17/);
  });
});
