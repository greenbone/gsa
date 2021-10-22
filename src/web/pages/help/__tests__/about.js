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

import {rendererWith, waitFor, fireEvent} from 'web/utils/testing';

import AboutPage from '../about';

setLocale('en');

describe('AboutPage tests', () => {
  test('should render about page', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };

    const {render} = rendererWith({gmp});

    const {baseElement, getByTestId} = render(<AboutPage />);

    const icon = getByTestId('svg-icon');
    const links = baseElement.querySelectorAll('a');
    const heading = baseElement.querySelector('h1');
    const version = baseElement.querySelector('h3');
    const image = baseElement.querySelector('img');

    expect(icon).toHaveTextContent('help.svg');

    expect(links.length).toEqual(3);
    expect(links[0]).toHaveTextContent('Greenbone Networks GmbH');
    expect(links[1]).toHaveTextContent('(full license text)');
    expect(links[2]).toHaveTextContent('here');

    expect(heading).toHaveTextContent('Greenbone Security Assistant');

    expect(version).toHaveTextContent('1337.42');

    expect(image).toHaveAttribute('src', '/img/greenbone_banner.jpeg');
  });

  test('should open external link dialog on click', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };
    const {render} = rendererWith({gmp});

    const {baseElement, getByTestId} = render(<AboutPage />);

    const links = baseElement.querySelectorAll('a');

    fireEvent.click(links[1]);

    await waitFor(() => baseElement.querySelectorAll('dialog'));

    const dialogTitleBar = getByTestId('dialog-title-bar');
    const dialogButtons = baseElement.querySelectorAll('button');
    expect(dialogTitleBar).toHaveTextContent('You are leaving GSA');
    expect(dialogButtons.length).toEqual(2);
  });
});
