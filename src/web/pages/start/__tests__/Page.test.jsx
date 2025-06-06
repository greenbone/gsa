/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {within, rendererWith, wait, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import StartPage from 'web/pages/start/Page';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const manualUrl = 'test/';

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: {defaults: {foo: 'bar'}},
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const saveDashboardSetting = testing.fn().mockResolvedValue({foo: 'bar'});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('StartPage tests', () => {
  test('should render full StartPage', async () => {
    const gmp = {
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
        getSetting: getDashboardSetting,
        saveSetting: saveDashboardSetting,
      },
      settings: {manualUrl},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<StartPage />);

    await wait();

    const displays = screen.getAllByTestId('grid-item');
    const spans = baseElement.querySelectorAll('span');

    // Toolbar Icons
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Dashboards',
    );

    // Tabs
    expect(spans[3]).toHaveTextContent('Overview');
    expect(screen.getByTestId('add-dashboard')).toHaveAttribute(
      'title',
      'Add new Dashboard',
    );

    // Dashboard Controls
    expect(screen.getByTestId('add-dashboard-display')).toHaveAttribute(
      'title',
      'Add new Dashboard Display',
    );
    expect(screen.getByTestId('reset-dashboard')).toHaveAttribute(
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
});
