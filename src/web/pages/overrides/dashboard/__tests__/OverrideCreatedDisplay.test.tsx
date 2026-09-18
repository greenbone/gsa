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
  OverridesCreatedDisplay,
  OverridesCreatedTableDisplay,
} from 'web/pages/overrides/dashboard/OverrideCreatedDisplay';

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
            {dataRow(row).join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  overrides: {
    getCreatedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=override', counts: {}},
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

describe('OverridesCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesCreatedDisplay).toBeDefined();
    expect(typeof OverridesCreatedDisplay).toBe('function');
    expect(OverridesCreatedDisplay.displayId).toBe('override-by-created');
    expect(OverridesCreatedDisplay.displayName).toBe('OverridesCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesCreatedDisplay.displayId);

    expect(registered?.component).toBe(OverridesCreatedDisplay);
    expect(String(registered?.title)).toBe('Chart: Overrides by Creation Time');
  });

  test('should render the configured chart labels', async () => {
    renderDisplay(<OverridesCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of created Overrides',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total Overrides',
      );
    });
  });
});

describe('OverridesCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(OverridesCreatedTableDisplay).toBeDefined();
    expect(typeof OverridesCreatedTableDisplay).toBe('function');
    expect(OverridesCreatedTableDisplay.displayId).toBe(
      'override-by-created-table',
    );
    expect(OverridesCreatedTableDisplay.displayName).toBe(
      'OverridesCreatedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(OverridesCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(OverridesCreatedTableDisplay);
    expect(String(registered?.title)).toBe('Table: Overrides by Creation Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<OverridesCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Overrides by Creation Time',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of created Overrides|Total Overrides',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
    });
  });
});
