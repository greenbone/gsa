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
  TasksMostHighResultsDisplay,
  TasksMostHighResultsTableDisplay,
} from 'web/pages/tasks/dashboard/TaskMostHighResultsDisplay';

const loaderData = {
  groups: [
    {
      value: 'task-1',
      text: {name: 'Task One', high_per_host: '2.5', severity: '7.5'},
    },
    {
      value: 'task-2',
      text: {name: 'Task Two', high_per_host: '1.25', severity: '4.0'},
    },
    {
      value: 'task-3',
      text: {name: 'Task Three', high_per_host: '0', severity: '1.0'},
    },
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, severityRating, title}) => {
    const transformedData = dataTransform
      ? dataTransform(data, {severityRating})
      : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.()}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data: transformedData,
              svgRef: {current: null},
            })
          : children}
      </div>
    );
  },
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

vi.mock('web/components/chart/BarChart', () => ({
  default: ({data, xLabel}) => (
    <div data-testid="mock-bar-chart">
      <span data-testid="x-label">{xLabel}</span>
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.x}|{row.y}
        </span>
      ))}
    </div>
  ),
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=task', counts: {}},
    }),
  },
  settings: {severityRating: 'CVSSv3'},
  tasks: {
    getHighResultsAggregates: testing
      .fn()
      .mockResolvedValue({data: loaderData}),
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

describe('TasksMostHighResultsDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksMostHighResultsDisplay).toBeDefined();
    expect(typeof TasksMostHighResultsDisplay).toBe('function');
    expect(TasksMostHighResultsDisplay.displayId).toBe(
      'task-by-most-high-results',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksMostHighResultsDisplay.displayId);

    expect(registered?.component).toBe(TasksMostHighResultsDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: Tasks with most High Results per Host',
    );
  });

  test('should render the loaded high results', async () => {
    renderDisplay(<TasksMostHighResultsDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tasks with most High Results per Host',
      );
      expect(screen.getByTestId('x-label')).toHaveTextContent(
        'Results per Host',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Task One|2.5',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        'Task Two|1.25',
      );
      expect(screen.queryByText(/Task Three/)).toBeNull();
    });
  });
});

describe('TasksMostHighResultsTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksMostHighResultsTableDisplay).toBeDefined();
    expect(typeof TasksMostHighResultsTableDisplay).toBe('function');
    expect(TasksMostHighResultsTableDisplay.displayId).toBe(
      'task-by-most-high-results-table',
    );
    expect(TasksMostHighResultsTableDisplay.displayName).toBe(
      'TasksMostHighResultsTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksMostHighResultsTableDisplay.displayId);

    expect(registered?.component).toBe(TasksMostHighResultsTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: Tasks with most High Results per Host',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <TasksMostHighResultsTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tasks with most High Results per Host',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Task Name|Max. High per Host',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'Task One|2.5',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        'Task Two|1.25',
      );
      expect(screen.queryByText(/Task Three/)).toBeNull();
    });
  });
});
