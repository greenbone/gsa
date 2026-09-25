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
  NvtsCreatedDisplay,
  NvtsCreatedTableDisplay,
} from 'web/pages/nvts/dashboard/NvtCreatedDisplay';

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
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(transformedData)?.[index]?.join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  nvts: {
    getCreatedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=nvt', counts: {}},
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

describe('NvtsCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsCreatedDisplay).toBeDefined();
    expect(NvtsCreatedDisplay.displayId).toBe('nvt-by-created');
    expect(NvtsCreatedDisplay.displayName).toBe('NvtCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsCreatedDisplay.displayId);

    expect(registered?.component).toBe(NvtsCreatedDisplay);
    expect(String(registered?.title)).toBe('Chart: NVTs by Creation Time');
  });

  test('should render the configured chart labels', async () => {
    renderDisplay(<NvtsCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of created NVTs',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total NVTs',
      );
    });
  });
});

describe('NvtsCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NvtsCreatedTableDisplay).toBeDefined();
    expect(NvtsCreatedTableDisplay.displayId).toBe('nvt-by-created-table');
    expect(NvtsCreatedTableDisplay.displayName).toBe('nvtCreatedTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NvtsCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(NvtsCreatedTableDisplay);
    expect(String(registered?.title)).toBe('Table: NVTs by Creation Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<NvtsCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'NVTs by Creation Time',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of NVTs|Total NVTs',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
    });
  });
});
