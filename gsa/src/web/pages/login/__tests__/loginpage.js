/* Copyright (C) 2019 Greenbone Networks GmbH
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

import Logger from 'gmp/log';

import {rendererWith, fireEvent, waitForElement} from 'web/utils/testing';

import LoginPage from '../loginpage';

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

    const {getByName, getByTestId} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
    fireEvent.click(button);

    expect(login).toBeCalledWith('foo', 'bar');
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

    const {getByTestId} = render(<LoginPage />);

    const button = getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(login).toBeCalledWith('foo', 'bar');
  });

  test('should display error message', async () => {
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

    const {getByName, getByTestId} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
    fireEvent.click(button);
    expect(login).toBeCalledWith('foo', 'bar');

    const error = await waitForElement(() => getByTestId('error'));
    expect(error).toHaveTextContent('Just a test');
  });
});
