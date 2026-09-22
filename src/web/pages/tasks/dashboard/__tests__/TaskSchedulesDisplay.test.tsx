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
  TasksSchedulesDisplay,
  TasksSchedulesTableDisplay,
} from 'web/pages/tasks/dashboard/TaskSchedulesDisplay';

const scheduledTask = {
  name: 'Scheduled Task',
  schedule: {
    event: {
      durationInSeconds: 3600,
      getNextDates: () => [],
      nextDate: '2026-01-01T10:00:00Z',
      recurrence: {freq: undefined, interval: 1},
    },
    timezone: 'UTC',
  },
};

const loaderData = [scheduledTask, {name: 'Task Without Schedule'}];

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, endDate, title}) => {
    const transformedData = dataTransform
      ? dataTransform(data, {endDate})
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
  default: ({data, dataRow, dataTitles, dataTransform, endDate, title}) => {
    const transformedData = dataTransform
      ? dataTransform(data, {endDate})
      : data;

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

vi.mock('web/components/chart/ScheduleChart', () => ({
  default: ({data}) => (
    <div data-testid="mock-schedule-chart">
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.label}|{row.duration}|{row.starts.length}
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
  tasks: {
    getAll: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('TasksSchedulesDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksSchedulesDisplay).toBeDefined();
    expect(typeof TasksSchedulesDisplay).toBe('function');
    expect(TasksSchedulesDisplay.displayId).toBe('task-by-schedules');
    expect(TasksSchedulesDisplay.displayName).toBe('TasksScheduleDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksSchedulesDisplay.displayId);

    expect(registered?.component).toBe(TasksSchedulesDisplay);
    expect(String(registered?.title)).toBe('Chart: Next Scheduled Tasks');
  });

  test('should render the loaded scheduled tasks', async () => {
    renderDisplay(<TasksSchedulesDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Next Scheduled Tasks',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Scheduled Task|3600|0',
      );
      expect(screen.queryByText(/Task Without Schedule/)).toBeNull();
    });
  });
});

describe('TasksSchedulesTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksSchedulesTableDisplay).toBeDefined();
    expect(typeof TasksSchedulesTableDisplay).toBe('function');
    expect(TasksSchedulesTableDisplay.displayId).toBe(
      'task-by-schedules-table',
    );
    expect(TasksSchedulesTableDisplay.displayName).toBe(
      'TasksSchedulesTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksSchedulesTableDisplay.displayId);

    expect(registered?.component).toBe(TasksSchedulesTableDisplay);
    expect(String(registered?.title)).toBe('Table: Next Scheduled Tasks');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<TasksSchedulesTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Next Scheduled Tasks',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Task Name|Next Schedule Time',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        'Scheduled Task',
      );
      expect(screen.queryByText(/Task Without Schedule/)).toBeNull();
    });
  });
});
