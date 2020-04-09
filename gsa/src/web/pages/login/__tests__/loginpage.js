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

import {rendererWith, fireEvent, waitForElement} from 'web/utils/testing';
import {MockedProvider} from '@apollo/react-testing';

import LoginPage, {LOGIN} from '../loginpage';

Logger.setDefaultLevel('silent');

describe('LoginPagetests', () => {
  test('should render Loginpage', () => {
    const isLoggedIn = jest.fn().mockReturnValue(false);
    const clearToken = jest.fn();
    const gmp = {isLoggedIn, clearToken, settings: {}};

    const {render} = rendererWith({gmp, router: true, store: true});

    const {baseElement} = render(<LoginPage />);

    expect(baseElement).toMatchSnapshot();
  });

  test('should allow to login with username and password', () => {
    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: {
            username: 'foo',
            password: 'bar',
          },
        },
        newData: jest.fn(() => ({
          data: {
            login: {
              ok: true,
              timezone: '',
              sessionTimeout: '',
            },
          },
        })),
      },
    ];

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
      login,
      isLoggedIn,
      clearToken,
      settings: {},
    };

    const {render} = rendererWith({gmp, router: true, store: true});

    const {getByName, getByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginPage />
      </MockedProvider>,
    );

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
    fireEvent.click(button);

    expect(mocks[0].newData).toHaveBeenCalled();
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

  test('should allow to login as guest', () => {
    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: {
            username: 'foo',
            password: 'bar',
          },
        },
        newData: jest.fn(() => ({
          data: {
            login: {
              ok: true,
              timezone: '',
              sessionTimeout: '',
            },
          },
        })),
      },
    ];

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
      login,
      isLoggedIn,
      clearToken,
      settings: {guestUsername: 'foo', guestPassword: 'bar'},
    };
    const {render} = rendererWith({gmp, router: true, store: true});

    const {getByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginPage />
      </MockedProvider>,
    );

    const button = getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(mocks[0].newData).toHaveBeenCalled();
  });

  test('should display error message', async () => {
    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: {
            username: 'foo',
            password: 'bar',
          },
        },
        newData: jest.fn(() => ({
          errors: [{message: 'Just a test'}],
        })),
      },
    ];

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
      settings: {},
    };
    const {render} = rendererWith({gmp, router: true, store: true});

    const {getByName, getByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginPage />
      </MockedProvider>,
    );

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
    fireEvent.click(button);
    expect(mocks[0].newData).toHaveBeenCalled();

    const error = await waitForElement(() => getByTestId('error'));
    expect(error).toHaveTextContent('Just a test');
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
