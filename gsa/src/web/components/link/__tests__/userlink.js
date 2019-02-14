/* Copyright (C) 2018 Greenbone Networks GmbH
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

import date from 'gmp/models/date';

import {longDate, setLocale} from 'gmp/locale/date';

import {setSessionTimeout, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import UserLink from '../userlink';

setLocale('en');

describe('UserLink tests', () => {
  test('should render username and timeout', () => {
    const timeout = date().add(5, 'minutes');

    const {store, render} = rendererWith({store: true, router: true});

    store.dispatch(setSessionTimeout(timeout));
    store.dispatch(setUsername('foo'));

    const {element} = render(<UserLink />);

    expect(element).toHaveTextContent('foo');
    expect(element.title).toMatch(longDate(timeout));
  });

  test('should apply styling', () => {
    const timeout = date('2018-10-10');

    const {store, render} = rendererWith({store: true, router: true});

    store.dispatch(setSessionTimeout(timeout));
    store.dispatch(setUsername('foo'));

    const {element} = render(<UserLink />);
    expect(element).toMatchSnapshot();
  });

  test('should route to usersettings on click', () => {
    const timeout = date('2018-10-10');

    const {store, history, render} = rendererWith({store: true, router: true});

    store.dispatch(setSessionTimeout(timeout));
    store.dispatch(setUsername('foo'));

    const {element} = render(<UserLink />);

    fireEvent.click(element);

    expect(history.location.pathname).toMatch('usersettings');
  });
});

// vim: set ts=2 sw=2 tw=80:
