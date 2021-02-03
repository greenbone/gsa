/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import NVT from 'gmp/models/nvt';
import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = NVT.fromElement({
  _oid: '1.3.6.1.4.1.25623.1.0',
  name: 'foo',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  family: 'bar',
  cvss_base: 5,
  qod: {value: 80},
  tags: 'This is a description|solution_type=VendorFix',
  solution: {
    _type: 'VendorFix',
    __text: 'This is a description',
  },
  refs: {
    ref: [
      {_type: 'cve', _id: 'CVE-2020-1234'},
      {_type: 'cve', _id: 'CVE-2020-5678'},
    ],
  },
});

describe('NVT row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleFilterChanged = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onFilterChanged={handleFilterChanged}
      />,
    );

    const bars = getAllByTestId('progressbar-box');
    const links = baseElement.querySelectorAll('a');
    const icons = baseElement.querySelectorAll('svg');

    expect(baseElement).toHaveTextContent('foo');

    expect(links[0]).toHaveAttribute('href', '/nvts?filter=family%3D%22bar%22');
    expect(links[0]).toHaveTextContent('bar');

    expect(baseElement).toHaveTextContent('Mon, Jun 24, 2019 1:55 PM CEST');
    expect(baseElement).toHaveTextContent('Mon, Jun 24, 2019 12:12 PM CEST');

    expect(links[1]).toHaveAttribute('href', '/cve/CVE-2020-1234');
    expect(links[1]).toHaveTextContent('CVE-2020-1234');

    expect(links[2]).toHaveAttribute('href', '/cve/CVE-2020-5678');
    expect(links[2]).toHaveTextContent('CVE-2020-5678');

    expect(icons[0]).toHaveTextContent('st_vendorfix.svg');

    expect(bars[0]).toHaveAttribute('title', 'Medium');
    expect(bars[0]).toHaveTextContent('5.0 (Medium)');

    expect(baseElement).toHaveTextContent('80 %');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleFilterChanged = jest.fn();

    const filter = Filter.fromString('family="bar"');

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onFilterChanged={handleFilterChanged}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      '1.3.6.1.4.1.25623.1.0',
    );

    const links = baseElement.querySelectorAll('a');
    fireEvent.click(links[0]);
    expect(handleFilterChanged).toHaveBeenCalledWith(filter);
  });

  console.warn = consoleError;
});
