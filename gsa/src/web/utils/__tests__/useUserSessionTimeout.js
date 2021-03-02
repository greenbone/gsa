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

import {dateFormat} from 'gmp/locale/date';
import date from 'gmp/models/date';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {setSessionTimeout as setSessionTimeoutAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from '../testing';

import useUserSessionTimeout from '../useUserSessionTimeout';

const TestUserSessionTimeout = () => {
  const [
    sessionTimeout,
    renewSession,
    setSessionTimeout,
  ] = useUserSessionTimeout();
  return (
    <div>
      <span
        data-testid="set"
        onClick={() => setSessionTimeout(date('2020-03-10'))}
      >
        {dateFormat(sessionTimeout, 'DD-MM-YY')}
      </span>
      <button data-testid="renew" onClick={() => renewSession()} />
    </div>
  );
};

describe('useUserSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
    };
    const {render, store} = rendererWith({store: true, gmp});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    render(<TestUserSessionTimeout />);

    const element = screen.getByTestId('set');
    expect(element).toHaveTextContent(/^10-10-19$/);
  });

  test('should allow to set the users session timeout', () => {
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
    };
    const {render, store} = rendererWith({store: true, gmp});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    render(<TestUserSessionTimeout />);

    const element = screen.getByTestId('set');

    expect(element).toHaveTextContent(/^10-10-19$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^10-03-20$/);
  });

  test('should allow to renew the users session timeout', async () => {
    const renewDate = date('2020-03-20');
    const [queryMock, resultFunc] = createRenewSessionQueryMock(renewDate);
    const renewSession = jest
      .fn()
      .mockReturnValue(Promise.resolve({data: renewDate}));
    const gmp = {
      user: {
        renewSession,
      },
      settings: {
        enableHyperionOnly: false,
      },
    };
    const {render, store} = rendererWith({
      store: true,
      gmp,
      queryMocks: [queryMock],
    });

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    render(<TestUserSessionTimeout />);

    const element = screen.getByTestId('set');

    expect(element).toHaveTextContent(/^10-10-19$/);

    const button = screen.getByTestId('renew');

    fireEvent.click(button);

    expect(renewSession).toHaveBeenCalled();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(element).toHaveTextContent(/^20-03-20$/);
  });
});
