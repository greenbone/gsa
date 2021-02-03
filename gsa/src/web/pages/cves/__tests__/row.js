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
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Cve from 'gmp/models/cve';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import CveRow from '../row';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  cvss_vector: 'AV:N/AC:M/Au:N/C:C/I:C/A:C',
  creationTime: '2020-10-22T19:15:00Z',
  score: '93',
  description: 'foo bar baz',
  usage_type: 'cve',
});

describe('CVEv2 Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    expect(baseElement).toHaveTextContent('CVE-2020-9992');

    // CVSS Base Vector
    const links = baseElement.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      '/cvsscalculator?cvssVector=AV%3AN%2FAC%3AM%2FAu%3AN%2FC%3AC%2FI%3AC%2FA%3AC',
    );
    expect(links[0]).toHaveTextContent('AV:N/AC:M/Au:N/C:C/I:C/A:C');

    // Published
    expect(baseElement).toHaveTextContent('Thu, Oct 22, 2020 9:15 PM CEST');

    // Severity
    const bars = getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('9.3 (High)');

    // Description
    expect(baseElement).toHaveTextContent('foo bar baz');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = jest.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      'CVE-2020-9992',
    );
  });

  console.warn = consoleError;
});

const entity_v3 = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H',
  creationTime: '2020-10-22T19:15:00Z',
  score: '71',
  description: 'foo bar baz',
  usage_type: 'cve',
});

describe('CVEv3 Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <CveRow
        entity={entity_v3}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    expect(baseElement).toHaveTextContent('CVE-2020-9992');

    // CVSS Base Vector
    const links = baseElement.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      '/cvsscalculator?cvssVector=CVSS%3A3.1%2FAV%3AL%2FAC%3AL%2FPR%3AN%2FUI%3AR%2FS%3AU%2FC%3AN%2FI%3AH%2FA%3AH',
    );
    expect(links[0]).toHaveTextContent(
      'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H',
    );

    // Published
    expect(baseElement).toHaveTextContent('Thu, Oct 22, 2020 9:15 PM CEST');

    // Severity
    const bars = getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('7.1 (High)');

    // Description
    expect(baseElement).toHaveTextContent('foo bar baz');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = jest.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      'CVE-2020-9992',
    );
  });

  console.warn = consoleError;
});
