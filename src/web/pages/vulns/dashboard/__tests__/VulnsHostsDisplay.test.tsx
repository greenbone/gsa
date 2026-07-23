/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import BaseFilter from 'gmp/models/filter/base-filter';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  VulnsHostsDisplay,
  VulnsHostsTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsHostsDisplay';

let loaderData: {groups?: {value: number; count: number; c_count: number}[]} = {
  groups: [],
};

vi.mock('web/pages/vulns/dashboard/VulnsLoaders', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  VulnsHostsLoader: ({children}) =>
    children({data: loaderData, isLoading: false}),
}));

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
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

vi.mock('web/pages/vulns/dashboard/VulnsHostsBarChart', () => ({
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
}));

describe('VulnsHostsDisplay', () => {
  test('should export VulnsHostsDisplay', () => {
    expect(VulnsHostsDisplay).toBeDefined();
    expect(typeof VulnsHostsDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsHostsDisplay.displayId).toBe('vuln-by-hosts');
  });

  test('should have displayName', () => {
    expect(VulnsHostsDisplay.displayName).toContain('VulnsHostsDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsHostsDisplay.displayId);
    expect(registered?.component).toBe(VulnsHostsDisplay);
    expect(String(registered?.title)).toBe('Chart: Vulnerabilities by Hosts');
  });

  test('should render the total vulnerabilities count in the title', () => {
    loaderData = {
      groups: [
        {value: 0, count: 1, c_count: 2},
        {value: 4, count: 1, c_count: 2},
      ],
    };
    const {render} = rendererWith();
    render(<VulnsHostsDisplay />);
    screen.getByText(/Total: 2/);
  });

  test('should call onFilterChanged with a range filter when clicking a bar', () => {
    loaderData = {
      groups: [
        {value: 0, count: 1, c_count: 2},
        {value: 4, count: 1, c_count: 2},
      ],
    };
    const onFilterChanged = testing.fn();
    const {render} = rendererWith();
    render(<VulnsHostsDisplay onFilterChanged={onFilterChanged} />);

    const bar = screen.getByRole('button', {name: 'bar-4-5'});
    bar.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    const newFilter = onFilterChanged.mock.calls[0][0];
    expect(newFilter.toFilterString()).toContain('hosts>3');
    expect(newFilter.toFilterString()).toContain('hosts<6');
  });

  test('should call onFilterChanged with a hosts=0 filter when clicking the zero-hosts bar', () => {
    loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    const onFilterChanged = testing.fn();
    const {render} = rendererWith();
    render(<VulnsHostsDisplay onFilterChanged={onFilterChanged} />);

    const bar = screen.getByRole('button', {name: 'bar-0'});
    bar.click();

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    const newFilter = onFilterChanged.mock.calls[0][0];
    expect(newFilter.toFilterString()).toContain('hosts=0');
  });

  test('should not call onFilterChanged if the filter already has the matching term', () => {
    loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    const onFilterChanged = testing.fn();
    const filter = BaseFilter.fromString('hosts=0');
    const {render} = rendererWith();
    render(
      <VulnsHostsDisplay filter={filter} onFilterChanged={onFilterChanged} />,
    );

    const bar = screen.getByRole('button', {name: 'bar-0'});
    bar.click();

    expect(onFilterChanged).not.toHaveBeenCalled();
  });

  test('should not throw when clicking a bar without onFilterChanged', () => {
    loaderData = {groups: [{value: 0, count: 1, c_count: 1}]};
    const {render} = rendererWith();
    render(<VulnsHostsDisplay />);

    const bar = screen.getByRole('button', {name: 'bar-0'});
    expect(() => bar.click()).not.toThrow();
  });
});

describe('VulnsHostsTableDisplay', () => {
  test('should export VulnsHostsTableDisplay', () => {
    expect(VulnsHostsTableDisplay).toBeDefined();
    expect(typeof VulnsHostsTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsHostsTableDisplay.displayId).toBe('vuln-by-hosts-table');
  });

  test('should have displayName', () => {
    expect(VulnsHostsTableDisplay.displayName).toContain(
      'VulnsHostsTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(VulnsHostsTableDisplay.displayId);
    expect(registered?.component).toBe(VulnsHostsTableDisplay);
    expect(String(registered?.title)).toBe('Table: Vulnerabilities by Hosts');
  });
});
