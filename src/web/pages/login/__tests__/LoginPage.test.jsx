/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Logger from 'gmp/log';
import {beforeEach, vi} from 'vitest';
import LoginPage from 'web/pages/login/LoginPage';
import {setIsLoggedIn} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/Testing';

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
    const isLoggedIn = testing.fn().mockReturnValue(false);
    const clearToken = testing.fn();
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

    const {getByTestId} = render(<LoginPage />);

    const button = getByTestId('guest-login-button');
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

    const {getByName, getByTestId} = render(<LoginPage />);

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = getByTestId('login-button');
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
      const {getByName, getByTestId} = render(<LoginPage />);

      return {
        login,
        gmp,
        getByName,
        getByTestId,
      };
    };

    test('should not show communityFeedNotification if not using community feed', async () => {
      const {login, gmp, getByName, getByTestId} = setupLoginPageTest({
        isCommunityFeed: false,
      });

      const usernameField = getByName('username');
      const passwordField = getByName('password');

      fireEvent.change(usernameField, {target: {value: 'foo'}});
      fireEvent.change(passwordField, {target: {value: 'bar'}});

      const button = getByTestId('login-button');
      fireEvent.click(button);

      expect(login).toBeCalledWith('foo', 'bar');
      await wait();
      expect(gmp.feedstatus.isCommunityFeed).toBeCalledTimes(1);

      const notificationTextKey = screen.queryByText(
        'You are currently using the free OpenVAS Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.',
      );
      expect(notificationTextKey).not.toBeInTheDocument();

      const notificationLinkText = screen.queryByText('Learn more');
      expect(notificationLinkText).not.toBeInTheDocument();
    });

    test('should call communityFeedNotification if using community feed', async () => {
      const {login, gmp, getByName, getByTestId} = setupLoginPageTest({
        isCommunityFeed: true,
      });

      const usernameField = getByName('username');
      const passwordField = getByName('password');

      fireEvent.change(usernameField, {target: {value: 'foo'}});
      fireEvent.change(passwordField, {target: {value: 'bar'}});

      const button = getByTestId('login-button');
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

      const notificationTextKey = await screen.findByText(
        'You are currently using the free OpenVAS Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.',
      );
      expect(notificationTextKey).toBeVisible();

      const notificationLinkText = await screen.findByText('Learn more');
      expect(notificationLinkText).toBeVisible();
    });
  });
});
