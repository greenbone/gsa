/* Copyright (C) 2024 Greenbone AG
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

import Capabilities from 'gmp/capabilities/capabilities';
import ReportConfig from 'gmp/models/reportconfig';

import {entityLoadingActions} from 'web/store/entities/reportconfigs';

import {rendererWith, fireEvent} from 'web/utils/testing';

import DetailsPage from '../detailspage';
import Filter from 'gmp/models/filter';
import CollectionCounts from 'gmp/collection/collectioncounts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {setLocale} from 'gmp/locale/date';

import {mockReportConfig} from '../__mocks__/mockreportconfig';

setLocale('en');

const entityType = 'reportconfig';
const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const getPermissions = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const config = ReportConfig.fromElement(mockReportConfig);
describe('Report Config Details Page tests', () => {
  test('should render full Details page with param details', () => {
    const getReportConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const gmp = {
      [entityType]: {
        get: getReportConfig,
      },
      permissions: {
        get: getPermissions,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const caps = new Capabilities(['everything']);

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {element} = render(<DetailsPage id="12345" />);
    expect(element).toMatchSnapshot();

    // Test parameter details
    const spans = element.querySelectorAll('span');
    expect(spans[8]).toHaveTextContent('Parameter Details');
    fireEvent.click(spans[8]);

    const paramTableRows = element.querySelectorAll('tr');
    expect(paramTableRows.length).toBe(7);

    let columns = paramTableRows[0].querySelectorAll('th');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('Name');
    expect(columns[1]).toHaveTextContent('Value');
    expect(columns[2]).toHaveTextContent('Using Default');
    expect(columns[3]).toHaveTextContent('Default Value');
    expect(columns[4]).toHaveTextContent('Minimum');
    expect(columns[5]).toHaveTextContent('Maximum');

    columns = paramTableRows[1].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('StringParam');
    expect(columns[1]).toHaveTextContent('StringValue');
    expect(columns[2]).toHaveTextContent('Yes');
    expect(columns[3]).toHaveTextContent('StringValue');
    expect(columns[4]).toHaveTextContent('0');
    expect(columns[5]).toHaveTextContent('1');

    columns = paramTableRows[2].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('TextParam');
    expect(columns[1]).toHaveTextContent('TextValue');
    expect(columns[2]).toHaveTextContent('No');
    expect(columns[3]).toHaveTextContent('TextDefault');
    expect(columns[4]).toHaveTextContent('0');
    expect(columns[5]).toHaveTextContent('1');

    columns = paramTableRows[3].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('IntegerParam');
    expect(columns[1]).toHaveTextContent('12');
    expect(columns[2]).toHaveTextContent('Yes');
    expect(columns[3]).toHaveTextContent('12');
    expect(columns[4]).toHaveTextContent('0');
    expect(columns[5]).toHaveTextContent('50');

    columns = paramTableRows[4].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('BooleanParam');
    expect(columns[1]).toHaveTextContent('Yes');
    expect(columns[2]).toHaveTextContent('No');
    expect(columns[3]).toHaveTextContent('No');
    expect(columns[4]).toHaveTextContent('0');
    expect(columns[5]).toHaveTextContent('1');

    columns = paramTableRows[5].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('SelectionParam');
    expect(columns[1]).toHaveTextContent('OptionB');
    expect(columns[2]).toHaveTextContent('No');
    expect(columns[3]).toHaveTextContent('OptionA');

    columns = paramTableRows[6].querySelectorAll('td');
    expect(columns.length).toBe(6);
    expect(columns[0]).toHaveTextContent('ReportFormatListParam');
    let detailsLinks = columns[1].querySelectorAll('a');
    expect(detailsLinks).toHaveLength(2);
    expect(detailsLinks[0]).toHaveTextContent('non-configurable-1');
    expect(detailsLinks[0]).toHaveAttribute('href', '/reportformat/654321');
    expect(detailsLinks[1]).toHaveTextContent('non-configurable-2');
    expect(detailsLinks[1]).toHaveAttribute('href', '/reportformat/7654321');
    expect(columns[2]).toHaveTextContent('No');
    detailsLinks = columns[3].querySelectorAll('a');
    expect(detailsLinks).toHaveLength(2);
    expect(detailsLinks[0]).toHaveTextContent('non-configurable-2');
    expect(detailsLinks[0]).toHaveAttribute('href', '/reportformat/7654321');
    expect(detailsLinks[1]).toHaveTextContent('configurable-2');
    expect(detailsLinks[1]).toHaveAttribute('href', '/reportformat/1234567');
  });
});
