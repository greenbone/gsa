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

import {setIsLoggedIn as setIsLoggedInAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from '../testing';

import useUserIsLoggedIn from '../useUserIsLoggedIn';

const TestUserIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useUserIsLoggedIn();
  return (
    <span onClick={() => setIsLoggedIn(false)}>
      {isLoggedIn ? 'yes' : 'no'}
    </span>
  );
};

describe('useUserIsLoggedIn tests', () => {
  test('should return the users login status', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedInAction(true));

    const {element} = render(<TestUserIsLoggedIn />);

    expect(element).toHaveTextContent(/^yes$/);
  });

  test('should allow to update the users login status', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedInAction(true));

    const {element} = render(<TestUserIsLoggedIn />);

    expect(element).toHaveTextContent(/^yes$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^no$/);
  });
});
