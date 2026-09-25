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
  TasksStatusDisplay,
  TasksStatusTableDisplay,
} from 'web/pages/tasks/dashboard/TaskStatusDisplay';

const loaderData = {
  groups: [
    {value: 'Running', count: 2},
    {value: 'Done', count: 3},
    {value: 'Stopped', count: 5},
  ],
};

vi.mock('web/components/dashboard/display/status/StatusDisplay', () => ({
  default: ({data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-status-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-point-${index}`}>
            {row.label}|{row.value}|{row.filterValue}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
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
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=task', counts: {}},
    }),
  },
  tasks: {
    getStatusAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('TasksStatusDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksStatusDisplay).toBeDefined();
    expect(typeof TasksStatusDisplay).toBe('function');
    expect(TasksStatusDisplay.displayId).toBe('task-by-status');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksStatusDisplay.displayId);

    expect(registered?.component).toBe(TasksStatusDisplay);
    expect(String(registered?.title)).toBe('Chart: Tasks by Status');
  });

  test('should render the loaded task statuses', async () => {
    renderDisplay(<TasksStatusDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tasks by Status (Total: 10)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Running|2|Running',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        'Done|3|Done',
      );
      expect(screen.getByTestId('data-point-2')).toHaveTextContent(
        'Stopped|5|Stopped',
      );
    });
  });
});

describe('TasksStatusTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksStatusTableDisplay).toBeDefined();
    expect(typeof TasksStatusTableDisplay).toBe('function');
    expect(TasksStatusTableDisplay.displayId).toBe('task-by-status-table');
    expect(TasksStatusTableDisplay.displayName).toBe('TasksStatusTableDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksStatusTableDisplay.displayId);

    expect(registered?.component).toBe(TasksStatusTableDisplay);
    expect(String(registered?.title)).toBe('Table: Tasks by Status');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<TasksStatusTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tasks by Status (Total: 10)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Status|# of Tasks',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Running|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Done|3');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent('Stopped|5');
    });
  });
});
