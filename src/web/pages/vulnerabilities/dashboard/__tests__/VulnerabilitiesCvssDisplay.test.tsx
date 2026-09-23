/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  VulnerabilitiesCvssDisplay,
  VulnerabilitiesCvssTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesCvssDisplay';

vi.mock('web/components/dashboard/display/cvss/CvssDisplay', () => ({
  default: ({title, data}) => {
    if (!data) {
      return null;
    }

    return <div data-testid="mock-cvss-display">{title?.({data})}</div>;
  },
}));

vi.mock('web/components/dashboard/display/cvss/CvssTableDisplay', () => ({
  default: ({title, data}) => {
    if (!data) {
      return null;
    }

    return <div data-testid="mock-cvss-table-display">{title?.({data})}</div>;
  },
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=vulnerability', counts: {}},
    }),
  },
  vulns: {
    getSeverityAggregates: testing.fn().mockResolvedValue({
      data: {total: 42},
    }),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('VulnerabilitiesCvssDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesCvssDisplay).toBeDefined();
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

  test('should render the total vulnerabilities count in the title', async () => {
    renderDisplay(<VulnerabilitiesCvssDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 42/)).toBeInTheDocument();
    });
  });
});

describe('VulnerabilitiesCvssTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesCvssTableDisplay).toBeDefined();
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

  test('should render the total vulnerabilities count in the title', async () => {
    renderDisplay(<VulnerabilitiesCvssTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 42/)).toBeInTheDocument();
    });
  });
});
