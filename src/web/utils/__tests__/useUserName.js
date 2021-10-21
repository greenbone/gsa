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
import React from 'react';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from '../testing';

import useUserName from '../useUserName';

const TestUserName = () => <span>{useUserName()[0]}</span>;

const TestUserName2 = () => {
  const [name, setUserName] = useUserName();
  return <span onClick={() => setUserName('bar')}>{name}</span>;
};

describe('useUserName tests', () => {
  test('should return the users name', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setUsername('foo'));

    const {element} = render(<TestUserName />);

    expect(element).toHaveTextContent(/^foo$/);
  });

  test('should allow to change the user name', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setUsername('foo'));

    const {element} = render(<TestUserName2 />);

    expect(element).toHaveTextContent(/^foo$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^bar$/);
  });
});
