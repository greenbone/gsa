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
  TicketsAssignedUsersDisplay,
  TicketsAssignedUsersTableDisplay,
} from 'web/pages/tickets/dashboard/TicketUsersAssignedDisplay';

const loaderData = [
  {assignedTo: {name: 'Alice'}},
  {assignedTo: {name: 'Alice'}},
  {assignedTo: {name: 'Bob'}},
  {assignedTo: {name: 'Bob'}},
  {assignedTo: {name: 'Carol'}},
  {},
];

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data: transformedData,
              state: {showLegend: true},
              setState: testing.fn(),
              svgRef: {current: null},
            })
          : children}
      </div>
    );
  },
}));

vi.mock('web/components/chart/DonutChart', () => ({
  default: ({data}) => (
    <div data-testid="mock-donut-chart">
      {data.map(row => (
        <span key={row.label} data-testid={`data-point-${row.label}`}>
          {row.label}|{row.value}|{row.filterValue}
        </span>
      ))}
    </div>
  ),
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

describe('TicketsAssignedUsersDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsAssignedUsersDisplay).toBeDefined();
    expect(typeof TicketsAssignedUsersDisplay).toBe('function');
    expect(TicketsAssignedUsersDisplay.displayId).toBe(
      'tickets-by-assigned-users',
    );
    expect(TicketsAssignedUsersDisplay.displayName).toBe(
      'TicketsAssignedUsersDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsAssignedUsersDisplay.displayId);

    expect(registered?.component).toBe(TicketsAssignedUsersDisplay);
    expect(String(registered?.title)).toBe('Chart: Tickets by Assigned User');
  });

  test('should render the loaded assigned users', async () => {
    renderDisplay(<TicketsAssignedUsersDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Assigned User (Total: 6)',
      );
      expect(screen.getByTestId('data-point-Alice')).toHaveTextContent(
        'Alice|2|Alice',
      );
      expect(screen.getByTestId('data-point-Bob')).toHaveTextContent(
        'Bob|2|Bob',
      );
      expect(screen.getByTestId('data-point-Carol')).toHaveTextContent(
        'Carol|1|Carol',
      );
    });
  });
});

describe('TicketsAssignedUsersTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TicketsAssignedUsersTableDisplay).toBeDefined();
    expect(typeof TicketsAssignedUsersTableDisplay).toBe('function');
    expect(TicketsAssignedUsersTableDisplay.displayId).toBe(
      'tickets-by-assigned-users-table',
    );
    expect(TicketsAssignedUsersTableDisplay.displayName).toBe(
      'TicketsAssignedUsersTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TicketsAssignedUsersTableDisplay.displayId);

    expect(registered?.component).toBe(TicketsAssignedUsersTableDisplay);
    expect(String(registered?.title)).toBe('Table: Tickets by Assigned User');
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <TicketsAssignedUsersTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Tickets by Assigned User (Total: 6)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Assigned To|# of Tickets',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Alice|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Bob|2');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent('Carol|1');
    });
  });
});
