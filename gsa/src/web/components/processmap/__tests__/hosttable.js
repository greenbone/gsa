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

import {rendererWith, fireEvent} from 'web/utils/testing';

import HostTable from '../hosttable';

setLocale('en');

const hosts = [
  {ip: '123.456.78.910', id: '1234', hostname: 'foo', severity: 5},
  {ip: '109.876.54.321', id: '5678', severity: undefined},
];

describe('HostTable tests', () => {
  test('should render HostTable', () => {
    const handleDeleteHost = jest.fn();
    const handleSelectHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <HostTable
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
      />,
    );

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render empty HostTable', () => {
    const handleDeleteHost = jest.fn();
    const handleSelectHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <HostTable
        hosts={[]}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
      />,
    );

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    expect(element).toHaveTextContent('No hosts associated with this process.');
  });

  test('should render HostTable with hosts', () => {
    const handleDeleteHost = jest.fn();
    const handleSelectHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <HostTable
        hosts={hosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
      />,
    );

    const header = element.querySelectorAll('th');
    const detailsLinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');
    const progressBars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Name');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('Actions');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/1234');
    expect(detailsLinks[0]).toHaveTextContent('details.svg');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.0 (Medium)');
    expect(icons[0]).toHaveAttribute('title', 'Remove host from process');
    expect(icons[1]).toHaveAttribute('title', 'Open all details');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('details.svg');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[2]).toHaveAttribute('title', 'Remove host from process');
    expect(icons[3]).toHaveAttribute('title', 'Open all details');
  });

  test('should call click handler', () => {
    const handleDeleteHost = jest.fn();
    const handleSelectHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {getAllByTestId} = render(
      <HostTable
        hosts={hosts}
        onDeleteHost={handleDeleteHost}
        onSelectHost={handleSelectHost}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    const links = getAllByTestId('hosttable-selectionlink');
    expect(icons[0]).toHaveAttribute('title', 'Remove host from process');
    fireEvent.click(icons[0]);
    expect(handleDeleteHost).toHaveBeenCalledWith(hosts[0].id);

    expect(links[0]).toHaveTextContent('123.456.78.910');
    fireEvent.click(links[0]);
    expect(handleSelectHost).toHaveBeenCalledWith(hosts[0]);
  });
});
