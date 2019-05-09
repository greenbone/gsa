/* Copyright (C) 2019 Greenbone Networks GmbH
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

import {rendererWith} from 'web/utils/testing';

import Titlebar from '../titlebar';
import {setIsLoggedIn, setUsername} from 'web/store/usersettings/actions';

import {setLocale} from 'gmp/locale/lang';

setLocale('en');

describe('Titlebar tests', () => {
  test('should render content if user is logged in', () => {
    const gmp = {settings: {vendorVersion: ''}};

    const {render, store} = rendererWith({gmp, router: true, store: true});

    store.dispatch(setUsername('username'));
    store.dispatch(setIsLoggedIn(true));

    const {baseElement} = render(<Titlebar />);

    expect(baseElement).toMatchSnapshot();
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('username');
    expect(baseElement).not.toHaveTextContent('Vendor Version');
  });

  test('should not render content if user is logged out', () => {
    const gmp = {settings: {vendorVersion: 'Vendor Version'}};

    const {render, store} = rendererWith({gmp, router: true, store: true});

    store.dispatch(setUsername('username'));
    store.dispatch(setIsLoggedIn(false));

    const {baseElement} = render(<Titlebar />);

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).not.toHaveTextContent('username');
    expect(baseElement).toHaveTextContent('Vendor Version');
  });
});
