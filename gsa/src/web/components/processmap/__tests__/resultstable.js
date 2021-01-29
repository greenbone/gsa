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

import {render as pureRender, rendererWith} from 'web/utils/testing';

import ResultTable from '../resultstable';

setLocale('en');

const results = [
  {id: '123', severity: 4, nvt: {name: 'bar', oid: '1337'}},
  {id: '456', severity: 8, nvt: {name: 'lorem', oid: '7353'}},
  {id: '789', severity: 1, nvt: {oid: '987'}},
];

describe('ResultTable tests', () => {
  test('should render ResultTable', () => {
    const {element} = pureRender(<ResultTable />);

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Result');
    expect(header[1]).toHaveTextContent('Severity');

    expect(element).not.toHaveTextContent('No host selected.');
  });

  test('should render empty ResultTable', () => {
    const {element} = pureRender(<ResultTable results={[]} />);

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Result');
    expect(header[1]).toHaveTextContent('Severity');

    expect(element).toHaveTextContent('No host selected.');
  });

  test('should render ResultTable with results', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element, getAllByTestId} = render(<ResultTable results={results} />);

    const header = element.querySelectorAll('th');
    const detailsLinks = getAllByTestId('details-link');
    const progressBars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Result');
    expect(header[1]).toHaveTextContent('Severity');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/result/123');
    expect(detailsLinks[0]).toHaveTextContent('bar');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('4.0 (Medium)');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/result/456');
    expect(detailsLinks[1]).toHaveTextContent('lorem');
    expect(progressBars[1]).toHaveAttribute('title', 'High');
    expect(progressBars[1]).toHaveTextContent('8.0 (High)');

    // Row 3
    expect(detailsLinks[2]).toHaveAttribute('href', '/result/789');
    expect(detailsLinks[2]).toHaveTextContent('987');
    expect(progressBars[2]).toHaveAttribute('title', 'Low');
    expect(progressBars[2]).toHaveTextContent('1.0 (Low)');
  });
});
