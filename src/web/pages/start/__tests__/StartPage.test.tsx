/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  within,
  rendererWith,
  wait,
  screen,
  fireEvent,
  waitFor,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import StartPage from 'web/pages/start/StartPage';

const manualUrl = 'test/';

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: QueryFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: {defaults: {foo: 'bar'}},
  meta: {
    filter: QueryFilter.fromString(),
    counts: new CollectionCounts(),
  },
});

const saveDashboardSetting = testing.fn().mockResolvedValue({foo: 'bar'});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: QueryFilter.fromString(),
    counts: new CollectionCounts(),
  },
});

const createGmp = (
  getSetting = getDashboardSetting,
  saveSetting = saveDashboardSetting,
) => ({
  tasks: {
    getSeverityAggregates: getAggregates,
    getStatusAggregates: getAggregates,
  },
  cves: {
    getCreatedAggregates: getAggregates,
  },
  nvts: {
    getSeverityAggregates: getAggregates,
  },
  filters: {
    get: getFilters,
  },
  dashboard: {
    getSetting,
    saveSetting,
  },
  settings: {manualUrl},
});

describe('StartPage tests', () => {
  test('should render a loading indicator while dashboard settings are loading', () => {
    const getSetting = testing.fn().mockResolvedValue({});
    const gmp = createGmp(getSetting);

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<StartPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(getSetting).toHaveBeenCalledWith(
      'd97eca9f-0386-4e5d-88f2-0ed7f60c0646',
    );
  });

  test('should render full StartPage', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<StartPage />);

    await wait();

    const displays = screen.getAllByTestId('grid-item');
    const newButtons = screen.getAllByRole('button', {name: 'New Icon'});
    expect(newButtons).toHaveLength(2);

    // Toolbar Icons
    expect(screen.getByTitle('Help: Dashboards')).toBeInTheDocument();

    // Tabs
    expect(screen.getByRole('tab', {name: /Overview/})).toHaveTextContent(
      'Overview',
    );
    expect(screen.getByTitle('Add new Dashboard')).toBeInTheDocument();

    // Dashboard Controls
    expect(screen.getByTitle('Add new Dashboard Display')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Reset Icon'})).toHaveAttribute(
      'title',
      'Reset to Defaults',
    );

    // Displays
    const tasksBySeverityClass = displays[0];
    const withinTasksBySeverityClass = within(tasksBySeverityClass);
    expect(tasksBySeverityClass).toHaveTextContent(
      'Tasks by Severity Class (Total: 0)',
    );
    expect(
      withinTasksBySeverityClass.getByTestId('filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      withinTasksBySeverityClass.getByTestId('download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      withinTasksBySeverityClass.getByTestId('legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');
    expect(
      withinTasksBySeverityClass.getByTestId('toggle-3d-icon'),
    ).toHaveAttribute('title', 'Toggle 2D/3D view');

    const tasksByStatus = displays[1];
    const withinTasksByStatus = within(tasksByStatus);
    expect(tasksByStatus).toHaveTextContent('Tasks by Status (Total: 0)');
    expect(withinTasksByStatus.getByTestId('filter-icon')).toHaveAttribute(
      'title',
      'Select Filter',
    );
    expect(
      withinTasksByStatus.getByTestId('download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(withinTasksByStatus.getByTestId('legend-icon')).toHaveAttribute(
      'title',
      'Toggle Legend',
    );
    expect(withinTasksByStatus.getByTestId('toggle-3d-icon')).toHaveAttribute(
      'title',
      'Toggle 2D/3D view',
    );

    const cvesByCreationTime = displays[2];
    const withinCvesByCreationTime = within(cvesByCreationTime);
    expect(cvesByCreationTime).toHaveTextContent('CVEs by Creation Time');
    expect(withinCvesByCreationTime.getByTestId('filter-icon')).toHaveAttribute(
      'title',
      'Select Filter',
    );
    expect(
      withinCvesByCreationTime.getByTestId('download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(withinCvesByCreationTime.getByTestId('legend-icon')).toHaveAttribute(
      'title',
      'Toggle Legend',
    );

    const nvtsBySeverityClass = displays[3];
    const withinNvtsBySeverityClass = within(nvtsBySeverityClass);
    expect(nvtsBySeverityClass).toHaveTextContent(
      'NVTs by Severity Class (Total: 0)',
    );
    expect(
      withinNvtsBySeverityClass.getByTestId('filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      withinNvtsBySeverityClass.getByTestId('download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      withinNvtsBySeverityClass.getByTestId('legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');
    expect(
      withinNvtsBySeverityClass.getByTestId('toggle-3d-icon'),
    ).toHaveAttribute('title', 'Toggle 2D/3D view');
  });

  test('should reset the active dashboard to its defaults', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<StartPage />);

    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Reset Icon'}),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Reset Icon'}));

    await waitFor(() => expect(saveDashboardSetting).toHaveBeenCalled());
    expect(saveDashboardSetting).toHaveBeenCalledWith(
      'd97eca9f-0386-4e5d-88f2-0ed7f60c0646',
      expect.objectContaining({
        byId: expect.objectContaining({
          '84fbe9f5-8ad4-43f0-9712-850182abb003': expect.objectContaining({
            rows: expect.any(Array),
          }),
        }),
      }),
    );
  });
});
