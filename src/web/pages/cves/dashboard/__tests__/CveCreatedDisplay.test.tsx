/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  CvesCreatedDisplay,
  CvesCreatedTableDisplay,
} from 'web/pages/cves/dashboard/CveCreatedDisplay';

const loaderData = {
  groups: [{value: '2026-01-01', count: '5', c_count: '10'}],
};

vi.mock('web/components/dashboard/display/created/CreatedDisplay', () => ({
  default: ({title, xAxisLabel, yAxisLabel, y2AxisLabel}) => (
    <div data-testid="mock-created-display">
      <span data-testid="title">{title?.()}</span>
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <span data-testid="y2-axis-label">{y2AxisLabel}</span>
    </div>
  ),
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.()}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {transformedData.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(row).join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  cves: {
    getCreatedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=cve', counts: {}},
    }),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp()});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('CvesCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesCreatedDisplay).toBeDefined();
    expect(typeof CvesCreatedDisplay).toBe('function');
    expect(CvesCreatedDisplay.displayId).toBe('cve-by-created');
    expect(CvesCreatedDisplay.displayName).toBe('CveCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesCreatedDisplay.displayId);

    expect(registered?.component).toBe(CvesCreatedDisplay);
    expect(String(registered?.title)).toBe('Chart: CVEs by Creation Time');
  });

  test('should render the configured chart labels', async () => {
    renderDisplay(<CvesCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CVEs by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of created CVEs',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total CVEs',
      );
    });
  });
});

describe('CvesCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(CvesCreatedTableDisplay).toBeDefined();
    expect(typeof CvesCreatedTableDisplay).toBe('function');
    expect(CvesCreatedTableDisplay.displayId).toBe('cve-by-created-table');
    expect(CvesCreatedTableDisplay.displayName).toBe('CveCreatedTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(CvesCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(CvesCreatedTableDisplay);
    expect(String(registered?.title)).toBe('Table: CVEs by Creation Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<CvesCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'CVEs by Creation Time',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of CVEs|Total CVEs',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
    });
  });
});
