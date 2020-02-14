/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {rendererWith, fireEvent} from 'web/utils/testing';

import HostTable from '../hosttable';

setLocale('en');

const hosts = [
  {name: '123.456.78.910', id: '1234', severity: 5},
  {name: '109.876.54.321', id: '5678', severity: undefined},
];

describe('HostTable tests', () => {
  test('should render HostTable', () => {
    const handleDeleteHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element} = render(<HostTable onDeleteHost={handleDeleteHost} />);

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).not.toHaveTextContent(
      'No hosts associated with this process.',
    );
  });

  test('should render empty HostTable', () => {
    const handleDeleteHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <HostTable hosts={[]} onDeleteHost={handleDeleteHost} />,
    );

    const header = element.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    expect(element).toHaveTextContent('No hosts associated with this process.');
  });

  test('should render HostTable with hosts', () => {
    const handleDeleteHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <HostTable hosts={hosts} onDeleteHost={handleDeleteHost} />,
    );

    const header = element.querySelectorAll('th');
    const detailsLinks = getAllByTestId('details-link');
    const icons = getAllByTestId('svg-icon');
    const progressBars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Host');
    expect(header[1]).toHaveTextContent('Severity');
    expect(header[2]).toHaveTextContent('Actions');

    // Row 1
    expect(detailsLinks[0]).toHaveAttribute('href', '/host/1234');
    expect(detailsLinks[0]).toHaveTextContent('123.456.78.910');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.0 (Medium)');
    expect(icons[0]).toHaveAttribute('title', 'Remove host from process');

    // Row 2
    expect(detailsLinks[1]).toHaveAttribute('href', '/host/5678');
    expect(detailsLinks[1]).toHaveTextContent('109.876.54.321');
    expect(progressBars[1]).toHaveAttribute('title', 'N/A');
    expect(progressBars[1]).toHaveTextContent('N/A');
    expect(icons[1]).toHaveAttribute('title', 'Remove host from process');
  });

  test('should call click handler', () => {
    const handleDeleteHost = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });

    const {getAllByTestId} = render(
      <HostTable hosts={hosts} onDeleteHost={handleDeleteHost} />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Remove host from process');
    fireEvent.click(icons[0]);
    expect(handleDeleteHost).toHaveBeenCalledWith(hosts[0].id);
  });
});
