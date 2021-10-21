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

import {setTimezone as setTimezoneAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from '../testing';

import useUserTimezone from '../useUserTimezone';

const TestUserTimezone = () => {
  const [timezone, setUserTimezone] = useUserTimezone();
  return <span onClick={() => setUserTimezone('UTC')}>{timezone}</span>;
};

describe('useUserTimezone tests', () => {
  test('should return the users timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('CET'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^CET$/);
  });

  test('should allow to update the user timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('CET'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^CET$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^UTC$/);
  });
});
