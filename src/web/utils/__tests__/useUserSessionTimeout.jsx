/* Copyright (C) 2019-2022 Greenbone AG
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

import {dateFormat} from 'gmp/locale/date';
import date from 'gmp/models/date';

import {setSessionTimeout as setSessionTimeoutAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from '../testing';

import useUserSessionTimeout from '../useUserSessionTimeout';

const TestUserSessionTimeout = () => {
  const [sessionTimeout, setSessionTimeout] = useUserSessionTimeout();
  return (
    <span onClick={() => setSessionTimeout(date('2020-03-10'))}>
      {dateFormat(sessionTimeout, 'DD-MM-YY')}
    </span>
  );
};

describe('useUserSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const {render, store} = rendererWith({store: true});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
  });

  test('should allow to set the users session timeout', () => {
    const {render, store} = rendererWith({store: true});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^10-03-20$/);
  });
});
