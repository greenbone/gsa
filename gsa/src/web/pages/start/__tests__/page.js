/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, screen} from 'web/utils/testing';

import StartPage from '../page';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const manualUrl = 'test/';

let getAggregates;
let getDashboardSetting;
let getFilters;
let saveDashboardSetting;

beforeEach(() => {
  getFilters = jest.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getDashboardSetting = jest.fn().mockResolvedValue({
    data: {defaults: {foo: 'bar'}},
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  saveDashboardSetting = jest.fn().mockResolvedValue({foo: 'bar'});

  getAggregates = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
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
    expect(spans[2]).toHaveTextContent('Overview');
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
