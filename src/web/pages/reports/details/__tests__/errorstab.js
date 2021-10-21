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

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import ErrorsTab from '../errorstab';

setLocale('en');

const caps = new Capabilities(['everything']);

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report Errors Tab tests', () => {
  test('should render Report Errors Tab', () => {
    const {errors} = getMockReport();

    const onSortChange = jest.fn();
    const onInteraction = jest.fn();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <ErrorsTab
        counts={errors.counts}
        errors={errors.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('errors', sortField)}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const links = baseElement.querySelectorAll('a');

    // Headings
    expect(header[0]).toHaveTextContent('Error Message');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('Hostname');
    expect(header[3]).toHaveTextContent('NVT');
    expect(header[4]).toHaveTextContent('Port');

    // Row 1
    expect(rows[1]).toHaveTextContent('This is an error.');
    expect(links[5]).toHaveAttribute('href', '/host/123');
    expect(links[5]).toHaveTextContent('123.456.78.910');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(links[6]).toHaveAttribute('href', '/nvt/314');
    expect(links[6]).toHaveTextContent('NVT1');
    expect(rows[1]).toHaveTextContent('123/tcp');

    // Row 2
    expect(rows[2]).toHaveTextContent('This is another error');
    expect(links[7]).toHaveAttribute('href', '/host/109');
    expect(links[7]).toHaveTextContent('109.876.54.321');
    expect(rows[2]).toHaveTextContent('lorem.ipsum');
    expect(links[8]).toHaveAttribute('href', '/nvt/159');
    expect(links[8]).toHaveTextContent('NVT2');
    expect(rows[2]).toHaveTextContent('456/tcp');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
