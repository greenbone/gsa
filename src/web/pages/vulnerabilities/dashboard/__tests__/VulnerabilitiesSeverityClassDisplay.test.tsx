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
  VulnerabilitiesSeverityDisplay,
  VulnerabilitiesSeverityTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesSeverityClassDisplay';

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassDisplay',
  () => ({
    default: ({title, data}) => {
      if (!data) {
        return null;
      }

      return <div data-testid="mock-severity-display">{title?.({data})}</div>;
    },
  }),
);

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassTableDisplay',
  () => ({
    default: ({title, data}) => {
      if (!data) {
        return null;
      }

      return (
        <div data-testid="mock-severity-table-display">{title?.({data})}</div>
      );
    },
  }),
);

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=vulnerability', counts: {}},
    }),
  },
  vulns: {
    getSeverityAggregates: testing.fn().mockResolvedValue({
      data: {total: 17},
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

describe('VulnerabilitiesSeverityDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesSeverityDisplay).toBeDefined();
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

  test('should render the total vulnerabilities count in the title', async () => {
    renderDisplay(<VulnerabilitiesSeverityDisplay height={200} width={200} />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 17/)).toBeInTheDocument();
    });
  });
});

describe('VulnerabilitiesSeverityTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(VulnerabilitiesSeverityTableDisplay).toBeDefined();
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

  test('should render the total vulnerabilities count in the title', async () => {
    renderDisplay(
      <VulnerabilitiesSeverityTableDisplay height={200} width={200} />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Total: 17/)).toBeInTheDocument();
    });
  });
});
