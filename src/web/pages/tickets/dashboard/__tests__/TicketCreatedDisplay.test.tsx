/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import date from 'gmp/models/date';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  TicketsCreatedDisplay,
  TicketsCreatedTableDisplay,
} from 'web/pages/tickets/dashboard/TicketCreatedDisplay';

const loaderData = [
  {creationTime: date('2026-01-01T10:00:00Z')},
  {creationTime: date('2026-01-01T12:00:00Z')},
  {creationTime: date('2026-01-02T10:00:00Z')},
];

vi.mock('web/components/dashboard/display/created/CreatedDisplay', () => ({
  default: ({
    data,
    dataTransform,
    title,
    xAxisLabel,
    yAxisLabel,
    y2AxisLabel,
  }) => {
    if (!data) {
      return null;
    }

    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-created-display">
        <span data-testid="title">{title?.()}</span>
        <span data-testid="x-axis-label">{xAxisLabel}</span>
        <span data-testid="y-axis-label">{yAxisLabel}</span>
        <span data-testid="y2-axis-label">{y2AxisLabel}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {row.y}|{row.y2}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    if (!data) {
      return null;
    }

    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.({data})}</span>
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
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=ticket', counts: {}},
    }),
  },
  tickets: {
    getAll: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('TicketsCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsCreatedDisplay).toBeDefined();
    expect(TicketsCreatedDisplay.displayId).toBe('tickets-by-created');
    expect(TicketsCreatedDisplay.displayName).toBe('TicketsCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsCreatedDisplay.displayId);

    expect(registered?.component).toBe(TicketsCreatedDisplay);
    expect(String(registered?.title)).toBe('Chart: Tickets by Creation Time');
  });

  test('should render the configured chart labels and transformed data', async () => {
    renderDisplay(<TicketsCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of created Tickets',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total Tickets',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('2|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('1|3');
    });
  });
});

describe('TicketsCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsCreatedTableDisplay).toBeDefined();
    expect(TicketsCreatedTableDisplay.displayId).toBe(
      'tickets-by-created-table',
    );
    expect(TicketsCreatedTableDisplay.displayName).toBe(
      'TicketsCreatedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(TicketsCreatedTableDisplay);
    expect(String(registered?.title)).toBe('Table: Tickets by Creation Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<TicketsCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Creation Time (Total: 3)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Created Tickets|Total Tickets|Time',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('2|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('1|3');
    });
  });
});
