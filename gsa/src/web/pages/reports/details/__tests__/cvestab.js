/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import CvesTab from '../cvestab';

setLocale('en');

const caps = new Capabilities(['everything']);

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report CVEs Tab tests', () => {
  test('should render Report CVEs Tab', () => {
    const {cves} = getMockReport();
    const onSortChange = jest.fn();
    const onInteraction = jest.fn();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <CvesTab
        counts={cves.counts}
        cves={cves.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('cves', sortField)}
      />,
    );

    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('CVE');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Occurrences');
    expect(header[4]).toHaveTextContent('Severity');

    // Row 1
    expect(links[5]).toHaveAttribute('href', '/cve/CVE-2019-1234');
    expect(links[5]).toHaveTextContent('CVE-2019-1234');
    expect(links[6]).toHaveAttribute('href', '/nvt/201');
    expect(links[6]).toHaveTextContent('nvt1');
    expect(rows[1]).toHaveTextContent('22'); // 2 Hosts, 2 Occurrences
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(links[7]).toHaveAttribute('href', '/cve/CVE-2019-5678');
    expect(links[7]).toHaveTextContent('CVE-2019-5678');
    expect(links[8]).toHaveAttribute('href', '/nvt/202');
    expect(links[8]).toHaveTextContent('nvt2');
    expect(rows[2]).toHaveTextContent('11'); // 1 Hosts, 1 Occurrences
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
