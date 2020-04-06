/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import date from 'gmp/models/date';
import {longDate} from 'gmp/locale/date';

import {setSessionTimeout, setUsername} from 'web/store/usersettings/actions';

import {fireEvent, rendererWith} from 'web/utils/testing';

import UserMenu from '../usermenu';

describe('UserMenu component tests', () => {
  test('should render UserMenu', () => {
    const {render} = rendererWith({gmp: {}, router: true, store: true});

    const {element} = render(<UserMenu />);

    expect(element).toMatchSnapshot();
  });

  test('should render username and sessionTimeout', () => {
    const {render, store} = rendererWith({gmp: {}, router: true, store: true});
    const timeout = date('2018-10-10');

    store.dispatch(setSessionTimeout(timeout));
    store.dispatch(setUsername('foo'));

    const {element} = render(<UserMenu />);

    expect(element).toHaveTextContent(longDate(timeout));
    expect(element).toHaveTextContent('foo');
  });

  test('should route to usersettings on click', () => {
    const {render, history} = rendererWith({
      gmp: {},
      store: true,
      router: true,
    });

    const {getByTestId} = render(<UserMenu />);
    const userSettingsElement = getByTestId('usermenu-settings');

    fireEvent.click(userSettingsElement);

    expect(history.location.pathname).toMatch('usersettings');
  });

  test('should logout user on click', () => {
    const doLogout = jest.fn().mockResolvedValue();
    const gmp = {
      doLogout,
    };
    const {render} = rendererWith({gmp, store: true, router: true});

    const {getByTestId} = render(<UserMenu />);
    const userSettingsElement = getByTestId('usermenu-logout');

    fireEvent.click(userSettingsElement);

    expect(gmp.doLogout).toHaveBeenCalled();
  });

  test('should renew session timeout on click', () => {
    const renewSession = jest
      .fn()
      .mockResolvedValue({data: '2019-10-10T12:00:00Z'});
    const gmp = {
      user: {
        renewSession,
      },
    };
    const {render} = rendererWith({gmp, store: true, router: true});

    const {getAllByTestId} = render(<UserMenu />);
    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[3]);

    expect(gmp.user.renewSession).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
