/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  VulnerabilitiesHostsDisplay,
  VulnerabilitiesHostsTableDisplay,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsDisplay';

type LoaderData = {
  groups?: {value: number; count: number; c_count: number}[];
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
    if (!data) {
      return null;
    }

    const transformedData = dataTransform ? dataTransform(data) : data;
    return (
      <div data-testid="mock-data-display">
        {title?.({data: transformedData})}
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

vi.mock(
  'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsBarChart',
  () => ({
    default: ({data, onDataClick}) => (
      <div data-testid="mock-bar-chart">
        {data.map(d => (
          <button
            key={d.id}
            onClick={() => onDataClick?.({filterValue: d.filterValue})}
          >
            bar-{d.x}
          </button>
        ))}
      </div>
    ),
  }),
);

const createGmp = (loaderData: LoaderData) => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=vulnerability', counts: {}},
    }),
  },
  vulns: {
    getHostAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
});

const renderDisplay = (component: ReactElement, loaderData: LoaderData) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(loaderData), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('VulnerabilitiesHostsDisplay', () => {
  test('should export VulnerabilitiesHostsDisplay', () => {
    expect(VulnerabilitiesHostsDisplay).toBeDefined();
    expect(VulnerabilitiesHostsDisplay.displayId).toBe('vuln-by-hosts');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnerabilitiesHostsDisplay.displayId);
    expect(registered?.component).toBe(VulnerabilitiesHostsDisplay);
    expect(String(registered?.title)).toBe('Chart: Vulnerabilities by Hosts');
  });

  test('should render the total vulnerabilities count in the title', async () => {
    const loaderData = {
      groups: [
        {value: 0, count: 1, c_count: 2},
        {value: 4, count: 1, c_count: 2},
      ],
    };
    renderDisplay(
      <VulnerabilitiesHostsDisplay height={200} width={200} />,
      loaderData,
    );
    await screen.findByText(/Total: 2/);
  });

  test('should call onFilterChanged with a range filter when clicking a bar', async () => {
    const loaderData = {
      groups: [
        {value: 0, count: 1, c_count: 2},
        {value: 4, count: 1, c_count: 2},
      ],
    };
    const onFilterChanged = testing.fn();
    renderDisplay(
      <VulnerabilitiesHostsDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
      loaderData,
    );

    const bar = await screen.findByRole('button', {name: 'bar-4-5'});
    bar.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    const newFilter = onFilterChanged.mock.calls[0][0];
    expect(newFilter.toFilterString()).toContain('hosts>3');
    expect(newFilter.toFilterString()).toContain('hosts<6');
  });

  test('should call onFilterChanged with a hosts=0 filter when clicking the zero-hosts bar', async () => {
    const loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    const onFilterChanged = testing.fn();
    renderDisplay(
      <VulnerabilitiesHostsDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
      loaderData,
    );

    const bar = await screen.findByRole('button', {name: 'bar-0'});
    bar.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    const newFilter = onFilterChanged.mock.calls[0][0];
    expect(newFilter.toFilterString()).toContain('hosts=0');
  });

  test('should not call onFilterChanged if the filter already has the matching term', async () => {
    const loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('hosts=0');
    renderDisplay(
      <VulnerabilitiesHostsDisplay
        filter={filter}
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
      loaderData,
    );

    const bar = await screen.findByRole('button', {name: 'bar-0'});
    bar.click();

    expect(onFilterChanged).not.toHaveBeenCalled();
  });

  test('should not throw when clicking a bar without onFilterChanged', async () => {
    const loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    renderDisplay(
      <VulnerabilitiesHostsDisplay height={200} width={200} />,
      loaderData,
    );

    const bar = await screen.findByRole('button', {name: 'bar-0'});
    expect(() => bar.click()).not.toThrow();
  });
});

describe('VulnerabilitiesHostsTableDisplay', () => {
  test('should export VulnerabilitiesHostsTableDisplay', () => {
    expect(VulnerabilitiesHostsTableDisplay).toBeDefined();
    expect(typeof VulnerabilitiesHostsTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnerabilitiesHostsTableDisplay.displayId).toBe(
      'vuln-by-hosts-table',
    );
  });

  test('should have displayName', () => {
    expect(VulnerabilitiesHostsTableDisplay.displayName).toContain(
      'VulnerabilitiesHostsTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnerabilitiesHostsTableDisplay.displayId);
    expect(registered?.component).toBe(VulnerabilitiesHostsTableDisplay);
    expect(String(registered?.title)).toBe('Table: Vulnerabilities by Hosts');
  });
});
