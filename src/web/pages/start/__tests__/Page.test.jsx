/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import StartPage from 'web/pages/start/Page';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {
  rendererWith,
  wait,
  getByTestId as getByTestIdFromElement,
  screen,
} from 'web/utils/Testing';

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
    expect(tasksBySeverityClass).toHaveTextContent(
      'Tasks by Severity Class (Total: 0)',
    );
    expect(
      getByTestIdFromElement(tasksBySeverityClass, 'filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      getByTestIdFromElement(tasksBySeverityClass, 'download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      getByTestIdFromElement(tasksBySeverityClass, 'legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');
    expect(
      getByTestIdFromElement(tasksBySeverityClass, 'toggle-3d-icon'),
    ).toHaveAttribute('title', 'Toggle 2D/3D view');

    const tasksByStatus = displays[1];
    expect(tasksByStatus).toHaveTextContent('Tasks by Status (Total: 0)');
    expect(
      getByTestIdFromElement(tasksByStatus, 'filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      getByTestIdFromElement(tasksByStatus, 'download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      getByTestIdFromElement(tasksByStatus, 'legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');
    expect(
      getByTestIdFromElement(tasksByStatus, 'toggle-3d-icon'),
    ).toHaveAttribute('title', 'Toggle 2D/3D view');

    const cvesByCreationTime = displays[2];
    expect(cvesByCreationTime).toHaveTextContent('CVEs by Creation Time');
    expect(
      getByTestIdFromElement(cvesByCreationTime, 'filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      getByTestIdFromElement(cvesByCreationTime, 'download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      getByTestIdFromElement(cvesByCreationTime, 'legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');

    const nvtsBySeverityClass = displays[3];
    expect(nvtsBySeverityClass).toHaveTextContent(
      'NVTs by Severity Class (Total: 0)',
    );
    expect(
      getByTestIdFromElement(nvtsBySeverityClass, 'filter-icon'),
    ).toHaveAttribute('title', 'Select Filter');
    expect(
      getByTestIdFromElement(nvtsBySeverityClass, 'download-svg-icon'),
    ).toHaveAttribute('title', 'Download SVG');
    expect(
      getByTestIdFromElement(nvtsBySeverityClass, 'legend-icon'),
    ).toHaveAttribute('title', 'Toggle Legend');
    expect(
      getByTestIdFromElement(nvtsBySeverityClass, 'toggle-3d-icon'),
    ).toHaveAttribute('title', 'Toggle 2D/3D view');
  });
});
