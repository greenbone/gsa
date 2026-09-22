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
  TicketsStatusDisplay,
  TicketsStatusTableDisplay,
} from 'web/pages/tickets/dashboard/TicketStatusDisplay';

const loaderData = [
  {status: 'Open'},
  {status: 'Open'},
  {status: 'Fixed'},
  {status: 'Closed'},
  {status: 'Closed'},
  {status: 'Closed'},
];

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
  const {render} = rendererWith({gmp: createGmp(), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('TicketsStatusDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsStatusDisplay).toBeDefined();
    expect(typeof TicketsStatusDisplay).toBe('function');
    expect(TicketsStatusDisplay.displayId).toBe('tickets-by-status');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsStatusDisplay.displayId);

    expect(registered?.component).toBe(TicketsStatusDisplay);
    expect(String(registered?.title)).toBe('Chart: Tickets by Status');
  });

  test('should render the loaded ticket statuses', async () => {
    renderDisplay(<TicketsStatusDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Status (Total: 6)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Open|2|Open',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        'Fixed|1|Fixed',
      );
      expect(screen.getByTestId('data-point-2')).toHaveTextContent(
        'Closed|3|Closed',
      );
    });
  });
});

describe('TicketsStatusTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsStatusTableDisplay).toBeDefined();
    expect(typeof TicketsStatusTableDisplay).toBe('function');
    expect(TicketsStatusTableDisplay.displayId).toBe('tickets-by-status-table');
    expect(TicketsStatusTableDisplay.displayName).toBe(
      'TicketsStatusTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsStatusTableDisplay.displayId);

    expect(registered?.component).toBe(TicketsStatusTableDisplay);
    expect(String(registered?.title)).toBe('Table: Tickets by Status');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<TicketsStatusTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Status (Total: 6)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Status|# of Tickets',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Open|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Fixed|1');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent('Closed|3');
    });
  });
});
