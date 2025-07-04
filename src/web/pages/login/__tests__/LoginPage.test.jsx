/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import {vi} from 'vitest';
import Logger from 'gmp/log';
import LoginPage from 'web/pages/login/LoginPage';
import {setIsLoggedIn} from 'web/store/usersettings/actions';

Logger.setDefaultLevel('silent');
const mockNavigate = testing.fn();
const mockUseNavigate = testing.fn().mockReturnValue(mockNavigate);
const mockUseLocation = testing.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

describe('LoginPage tests', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });
  test('should render LoginPage', () => {
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const gmp = {isLoggedIn, clearToken, settings: {}};

    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);
  });

  test('should allow to login with username and password', () => {
    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      username: 'username',
      token: 'token',
      timezone: 'timezone',
    });
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const setLocale = testing.fn();
    const setTimezone = testing.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {},
    };
    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(login).toBeCalledWith('foo', 'bar');
  });

  test('should not display guest login by default', () => {
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const gmp = {
      isLoggedIn,
      clearToken,
      settings: {},
    };
    const {render} = rendererWith({gmp, router: true, store: true});
    render(<LoginPage />);

    expect(screen.queryByTestId('guest-login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-login-button')).not.toBeInTheDocument();
  });

  test('should allow to login as guest', () => {
    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      username: 'username',
      token: 'token',
      timezone: 'timezone',
    });
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const setLocale = testing.fn();
    const setTimezone = testing.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {guestUsername: 'foo', guestPassword: 'bar'},
    };
    const {render} = rendererWith({gmp, router: true, store: true});
    render(<LoginPage />);

    const button = screen.getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(login).toBeCalledWith('foo', 'bar');
  });

  test('should display error message', async () => {
    const login = testing.fn().mockRejectedValue({message: 'Just a test'});
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const setLocale = testing.fn();
    const setTimezone = testing.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {},
    };
    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    expect(login).toBeCalledWith('foo', 'bar');

    const error = await screen.findByTestId('error');
    expect(error).toHaveTextContent('Just a test');
  });

  test('should redirect to main page if already logged in', () => {
    const gmp = {settings: {}};

    const {render, store} = rendererWith({gmp, router: true, store: true});

    store.dispatch(setIsLoggedIn(true));

    render(<LoginPage />);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith('/dashboards', {replace: true});
  });

  test('should dispatch timezone to Redux after login', async () => {
    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      token: 'token',
      timezone: 'Australia/Sydney',
      sessionTimeout: '10:00',
    });
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const setLocale = testing.fn();
    const setTimezone = testing.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {},
      user: {
        currentSettings: testing.fn().mockResolvedValue({
          data: {
            userinterfacetimeformat: {value: '24h'},
            userinterfacedateformat: {value: 'YYYY-MM-DD'},
          },
        }),
      },
    };
    const {render, store} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(login).toBeCalledWith('foo', 'bar');

    await wait();

    const userSettings = store.getState().userSettings;
    expect(userSettings.timezone).toEqual('Australia/Sydney');
    expect(userSettings.username).toEqual('foo');
    expect(userSettings.isLoggedIn).toBe(true);

    expect(setTimezone).toHaveBeenCalledWith('Australia/Sydney');
  });

  test.each([
    {
      description:
        'should redirect to previous path with search and hash after login',
      locationState: {
        state: {
          from: {
            pathname: '/somewhere',
            search: '?foo=bar',
            hash: '#baz',
          },
        },
      },
      expectedPath: '/somewhere?foo=bar#baz',
    },
    {
      description:
        'should redirect to dashboards when no previous path is available',
      locationState: {},
      expectedPath: '/dashboards',
    },
  ])('$description', async ({locationState, expectedPath}) => {
    mockUseNavigate.mockClear();

    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      token: 'token',
      timezone: 'Europe/Berlin',
      sessionTimeout: '10:00',
    });

    mockUseLocation.mockReturnValue(locationState);

    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
    const setLocale = testing.fn();
    const setTimezone = testing.fn();
    const gmp = {
      setTimezone,
      setLocale,
      login,
      isLoggedIn,
      clearToken,
      settings: {},
      user: {
        currentSettings: testing.fn().mockResolvedValue({
          data: {
            userinterfacetimeformat: {value: '24h'},
            userinterfacedateformat: {value: 'YYYY-MM-DD'},
          },
        }),
      },
    };
    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    render(<LoginPage />);
    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');
    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');
    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    await wait();
    expect(mockNavigate).toHaveBeenCalledWith(expectedPath, {
      replace: true,
    });
  });
});
