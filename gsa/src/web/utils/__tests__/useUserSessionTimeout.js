/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import {dateFormat} from 'gmp/locale/date';
import date from 'gmp/models/date';

import {setSessionTimeout} from 'web/store/usersettings/actions';

import {rendererWith} from '../testing';

import useUserSessionTimeout from '../useUserSessionTimeout';

const TestUserSessionTimeout = () => (
  <span>{dateFormat(useUserSessionTimeout(), 'DD-MM-YY')}</span>
);

describe('useUserSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const {render, store} = rendererWith({store: true});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeout(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
  });
});
