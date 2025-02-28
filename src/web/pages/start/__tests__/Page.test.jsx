/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import StartPage from 'web/pages/start/Page';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, screen} from 'web/utils/Testing';


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

    const displays = await screen.findAllByTestId('grid-item');
    const icons = screen.getAllByTestId('svg-icon');
    const spans = baseElement.querySelectorAll('span');

    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Dashboards');

    // Tabs
    expect(spans[3]).toHaveTextContent('Overview');
    expect(icons[2]).toHaveAttribute('title', 'Add new Dashboard');

    // Dashboard Controls
    expect(icons[3]).toHaveAttribute('title', 'Add new Dashboard Display');
    expect(icons[4]).toHaveAttribute('title', 'Reset to Defaults');

    // Displays
    expect(displays[0]).toHaveTextContent('Tasks by Severity Class (Total: 0)');
    expect(icons[5]).toHaveAttribute('title', 'Select Filter');
    expect(icons[6]).toHaveAttribute('title', 'Download SVG');
    expect(icons[7]).toHaveAttribute('title', 'Toggle Legend');
    expect(icons[8]).toHaveAttribute('title', 'Toggle 2D/3D view');

    expect(displays[1]).toHaveTextContent('Tasks by Status (Total: 0)');
    expect(icons[9]).toHaveAttribute('title', 'Select Filter');
    expect(icons[10]).toHaveAttribute('title', 'Download SVG');
    expect(icons[11]).toHaveAttribute('title', 'Toggle Legend');
    expect(icons[12]).toHaveAttribute('title', 'Toggle 2D/3D view');

    expect(displays[2]).toHaveTextContent('CVEs by Creation Time');
    expect(icons[13]).toHaveAttribute('title', 'Select Filter');
    expect(icons[14]).toHaveAttribute('title', 'Download SVG');
    expect(icons[15]).toHaveAttribute('title', 'Toggle Legend');

    expect(displays[3]).toHaveTextContent('NVTs by Severity Class (Total: 0)');
    expect(icons[16]).toHaveAttribute('title', 'Select Filter');
    expect(icons[17]).toHaveAttribute('title', 'Download SVG');
    expect(icons[18]).toHaveAttribute('title', 'Toggle Legend');
    expect(icons[19]).toHaveAttribute('title', 'Toggle 2D/3D view');
  });
});
