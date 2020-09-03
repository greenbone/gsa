/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import Logger from 'gmp/log';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import LoginPage from '../loginpage';
import {
  createLoginQueryMock,
  createLoginQueryErrorMock,
} from 'web/graphql/__mocks__/auth';

Logger.setDefaultLevel('silent');

describe('LoginPageTests', () => {
  test('should render LoginPage', () => {
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const gmp = {isLoggedIn, clearToken, settings: {}};

    const {render} = rendererWith({gmp, router: true, store: true});

    const {baseElement} = render(<LoginPage />);

    expect(baseElement).toMatchSnapshot();
  });

  test('should allow to login with username and password', async () => {
    const [loginMock, resultFunc] = createLoginQueryMock();
    const login = jest.fn().mockResolvedValue({
      locale: 'locale',
      username: 'username',
      token: 'token',
      timezone: 'timezone',
    });
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const setLocale = jest.fn();
    const setTimezone = jest.fn();

    const gmp = {
      setTimezone,
      setLocale,
      login: {login},
      isLoggedIn,
      clearToken,
      settings: {},
    };

    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
      queryMocks: [loginMock],
    });

    const {getByName, getByTestId} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });

  test('should not display guest login by default', () => {
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const gmp = {
      isLoggedIn,
      clearToken,
      settings: {},
    };
    const {render} = rendererWith({gmp, router: true, store: true});

    const {queryByTestId} = render(<LoginPage />);

    expect(queryByTestId('guest-login')).not.toBeInTheDocument();
    expect(queryByTestId('guest-login-button')).not.toBeInTheDocument();
  });

  test('should allow to login as guest', async () => {
    const [loginMock, resultFunc] = createLoginQueryMock();
    const login = jest.fn().mockResolvedValue({
      locale: 'locale',
      username: 'username',
      token: 'token',
      timezone: 'timezone',
    });
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const setLocale = jest.fn();
    const setTimezone = jest.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login: {login},
      isLoggedIn,
      clearToken,
      settings: {guestUsername: 'foo', guestPassword: 'bar'},
    };
    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
      queryMocks: [loginMock],
    });

    render(<LoginPage />);

    const button = screen.getByTestId('guest-login-button');
    fireEvent.click(button);

    await wait();

    expect(login).toHaveBeenCalledWith('foo', 'bar');
    expect(resultFunc).toHaveBeenCalled();
  });

  test('should display graphql error message', async () => {
    const [queryMock] = createLoginQueryErrorMock();
    const login = jest.fn().mockRejectedValue({message: 'Just a test'});
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const setLocale = jest.fn();
    const setTimezone = jest.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {
        enableHyperionOnly: true,
      },
    };
    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
      queryMocks: [queryMock],
    });

    const {getByName} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    await wait();

    expect(screen.getByTestId('error')).toHaveTextContent(
      'An error has occurred.',
    );
  });

  test('should display network error message', async () => {
    const error = {
      message: 'Response not successful: Received status code 500',
      result: {
        errors: [{message: 'Foo'}, {message: 'Bar'}],
      },
    };
    const [queryMock] = createLoginQueryErrorMock({error});

    const login = jest.fn().mockRejectedValue({message: 'Just a test'});
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const setLocale = jest.fn();
    const setTimezone = jest.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {
        enableHyperionOnly: true,
      },
    };
    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
      queryMocks: [queryMock],
    });

    const {getByName} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    await wait();

    expect(screen.getByTestId('error')).toHaveTextContent(
      'Response not successful: Received status code 500: Foo. Bar.',
    );
  });

  test('should redirect to main page if already logged in', () => {
    const login = jest.fn().mockResolvedValue({
      locale: 'locale',
      username: 'username',
      token: 'token',
      timezone: 'timezone',
    });
    const isLoggedIn = jest.fn().mockReturnValue(true);
    const clearToken = jest.fn();
    const setLocale = jest.fn();
    const setTimezone = jest.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {},
    };
    const {render, history} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    expect(history.location.pathname).toMatch(/^\/$/);
  });
});
