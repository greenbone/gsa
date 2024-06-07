/* Copyright (C) 2020-2022 Greenbone AG
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
import {describe, test, expect} from '@gsa/testing';

import {rendererWith} from 'web/utils/testing';

import {clickElement, getDialogTitle} from 'web/components/testing';

import AboutPage from '../about';

describe('AboutPage tests', () => {
  test('should render about page', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };

    const {render} = rendererWith({gmp});

    const {baseElement} = render(<AboutPage />);

    const links = baseElement.querySelectorAll('a');
    const heading = baseElement.querySelector('h1');
    const version = baseElement.querySelector('h3');
    const image = baseElement.querySelector('img');

    expect(links.length).toEqual(3);
    expect(links[0]).toHaveTextContent('Greenbone AG');
    expect(links[1]).toHaveTextContent('(full license text)');
    expect(links[2]).toHaveTextContent('here');

    expect(heading).toHaveTextContent('Greenbone Security Assistant');

    expect(version).toHaveTextContent('1337.42');

    expect(image).toHaveAttribute('src', '/img/greenbone_banner.png');
  });

  test('should open external link dialog on click', async () => {
    const gmp = {
      settings: {
        vendorVersion: '1337.42',
      },
    };
    const {render} = rendererWith({gmp});

    const {element} = render(<AboutPage />);

    const links = element.querySelectorAll('a');

    await clickElement(links[1]);

    expect(getDialogTitle()).toHaveTextContent('You are leaving GSA');
  });
});
