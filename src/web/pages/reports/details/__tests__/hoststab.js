/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import HostsTab from '../hoststab';

setLocale('en');

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

const gmp = {
  settings: {},
};

describe('Report Hosts Tab tests', () => {
  test('should render Report Hosts Tab', () => {
    const {hosts} = getMockReport();

    const onSortChange = jest.fn();
    const onInteraction = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <HostsTab
        counts={hosts.counts}
        filter={filter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');
    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('IP Address');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('OS');
    expect(header[3]).toHaveTextContent('Ports');
    expect(header[4]).toHaveTextContent('Apps');
    expect(header[5]).toHaveTextContent('Distance');
    expect(header[6]).toHaveTextContent('Auth');
    expect(header[7]).toHaveTextContent('Start');
    expect(header[8]).toHaveTextContent('End');
    expect(header[9]).toHaveTextContent('High');
    expect(header[10]).toHaveTextContent('Medium');
    expect(header[11]).toHaveTextContent('Low');
    expect(header[12]).toHaveTextContent('Log');
    expect(header[13]).toHaveTextContent('False Positive');
    expect(header[14]).toHaveTextContent('Total');
    expect(header[15]).toHaveTextContent('Severity');

    // Row 1
    expect(links[15]).toHaveAttribute('href', '/host/123');
    expect(links[15]).toHaveTextContent('123.456.78.910');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[1]).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(icons[4]).toHaveTextContent('verify.svg');
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[1]).toHaveTextContent('143050150'); // 14 High, 30 Medium, 5 Low, 0 Log, 1 False Positive, 50 Total
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(links[16]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    ); // filter by name because host has no asset id
    expect(links[16]).toHaveTextContent('109.876.54.321');
    expect(rows[2]).toHaveTextContent('lorem.ipsum');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[2]).toHaveTextContent('1521'); // 15 Ports, 2 Apps, 1 Distance
    expect(icons[5]).toHaveTextContent('verify_no.svg');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:31 PM CEST');
    expect(rows[2]).toHaveTextContent('53005040'); // 5 High, 30 Medium, 0 Low, 5 Log, 0 False Positive, 40 Total
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
