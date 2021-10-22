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

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import OperatingSystemsTab from '../operatingsystemstab';

setLocale('en');

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report Operating Systems Tab tests', () => {
  test('should render Report Operating Systems Tab', () => {
    const {operatingsystems} = getMockReport();

    const onSortChange = jest.fn();
    const onInteraction = jest.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <OperatingSystemsTab
        counts={operatingsystems.counts}
        operatingsystems={operatingsystems.entities}
        filter={filter}
        sortField={'severity'}
        sortReverse={true}
        isUpdating={false}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Operating System');
    expect(header[1]).toHaveTextContent('CPE');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Severity');

    // Row 1
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[4]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[4]).toHaveTextContent('Foo OS');
    expect(links[5]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[5]).toHaveTextContent('cpe:/foo/bar');
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(images[1]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[6]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[6]).toHaveTextContent('Lorem OS');
    expect(links[7]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[7]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
