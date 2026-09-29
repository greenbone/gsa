/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  TasksSeverityDisplay,
  TasksSeverityTableDisplay,
} from 'web/pages/tasks/dashboard/TaskSeverityClassDisplay';

const loaderData = {
  groups: [
    {value: '2.0', count: 12},
    {value: '7.5', count: 30},
  ],
};

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassDisplay',
  () => ({
    default: ({data, title}) => {
      return <div data-testid="mock-severity-display">{title?.({data})}</div>;
    },
  }),
);

vi.mock(
  'web/components/dashboard/display/severity/SeverityClassTableDisplay',
  () => ({
    default: ({data, dataTitles, title}) => {
      return (
        <div data-testid="mock-severity-table-display">
          <span data-testid="title">{title?.({data})}</span>
          <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        </div>
      );
    },
  }),
);

const createGmp = () => ({
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=task', counts: {}},
    }),
  },
  tasks: {
    getSeverityAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('TasksSeverityDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksSeverityDisplay).toBeDefined();
    expect(TasksSeverityDisplay.displayId).toBe('task-by-severity-class');
    expect(TasksSeverityDisplay.displayName).toBe('TasksSeverityDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksSeverityDisplay.displayId);

    expect(registered?.component).toBe(TasksSeverityDisplay);
    expect(String(registered?.title)).toBe('Chart: Tasks by Severity Class');
  });

  test('should render the total loaded task count', async () => {
    renderDisplay(<TasksSeverityDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-severity-display')).toHaveTextContent(
        'Tasks by Severity Class (Total: 42)',
      );
    });
  });
});

describe('TasksSeverityTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TasksSeverityTableDisplay).toBeDefined();
    expect(TasksSeverityTableDisplay.displayId).toBe(
      'task-by-severity-class-table',
    );
    expect(TasksSeverityTableDisplay.displayName).toBe(
      'TasksSeverityTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TasksSeverityTableDisplay.displayId);

    expect(registered?.component).toBe(TasksSeverityTableDisplay);
    expect(String(registered?.title)).toBe('Table: Tasks by Severity Class');
  });

  test('should render the total and table headings', async () => {
    renderDisplay(<TasksSeverityTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tasks by Severity Class (Total: 42)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Severity|# of Tasks',
      );
    });
  });
});
