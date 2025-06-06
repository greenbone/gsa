/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import {beforeEach, vi} from 'vitest';
import Logger from 'gmp/log';
import LoginPage from 'web/pages/login/LoginPage';
import {
  NOTIFICATION_SHOWN,
  NOTIFICATION_SHOWN_KEY,
} from 'web/pages/login/notifications/CommunityFeedUsageNotification';
import {setIsLoggedIn} from 'web/store/usersettings/actions';

Logger.setDefaultLevel('silent');
const mockUseNavigate = testing.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
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
    expect(mockUseNavigate).toBeCalledTimes(1);
    expect(mockUseNavigate).toBeCalledWith('/dashboards', {replace: true});
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

  describe('Community feed notification visibility based on user login and feed type', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: testing.fn(),
        getItem: testing.fn(),
        removeItem: testing.fn(),
        clear: testing.fn(),
      },
      writable: true,
    });

    //make a mock session sto
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: testing.fn(),
        getItem: testing.fn(),
        removeItem: testing.fn(),
        clear: testing.fn(),
      },
      writable: true,
    });

    const setupLoginPageTest = ({
      isCommunityFeed = false,
      loginResponse = {
        locale: 'locale',
        username: 'username',
        token: 'token',
        timezone: 'timezone',
      },
    } = {}) => {
      const login = testing.fn().mockResolvedValue(loginResponse);
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
        feedstatus: {
          isCommunityFeed: testing.fn().mockResolvedValue(isCommunityFeed),
        },
        user: {
          currentSettings: testing.fn().mockResolvedValue({
            data: {
              userinterfacetimeformat: {value: '24h'},
              userinterfacedateformat: {value: 'YYYY-MM-DD'},
            },
          }),
        },
      };
      const {render} = rendererWith({gmp, router: true, store: true});
      render(<LoginPage />);

      return {
        login,
        gmp,
      };
    };

    test('should not show communityFeedNotification if not using community feed', async () => {
      const {login, gmp} = setupLoginPageTest({
        isCommunityFeed: false,
      });

      const usernameField = screen.getByName('username');
      const passwordField = screen.getByName('password');

      changeInputValue(usernameField, 'foo');
      changeInputValue(passwordField, 'bar');

      const button = screen.getByTestId('login-button');
      fireEvent.click(button);

      expect(login).toBeCalledWith('foo', 'bar');
      await wait();
      expect(gmp.feedstatus.isCommunityFeed).toBeCalledTimes(1);

      expect(window.sessionStorage.setItem).not.toHaveBeenCalledWith(
        NOTIFICATION_SHOWN_KEY,
        NOTIFICATION_SHOWN,
      );
    });

    test('should call communityFeedNotification if using community feed', async () => {
      const {login, gmp} = setupLoginPageTest({
        isCommunityFeed: true,
      });

      const usernameField = screen.getByName('username');
      const passwordField = screen.getByName('password');

      changeInputValue(usernameField, 'foo');
      changeInputValue(passwordField, 'bar');

      const button = screen.getByTestId('login-button');
      fireEvent.click(button);

      expect(login).toBeCalledWith('foo', 'bar');
      await wait();

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'userInterfaceTimeFormat',
        '24h',
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'userInterfaceDateFormat',
        'YYYY-MM-DD',
      );

      expect(gmp.feedstatus.isCommunityFeed).toBeCalledTimes(1);

      await wait();
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATION_SHOWN_KEY,
        NOTIFICATION_SHOWN,
      );
    });
  });
});
