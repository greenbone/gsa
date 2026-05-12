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
import {ResponseRejection} from 'gmp/http/rejection';
import Logger from 'gmp/log';
import {createSession} from 'gmp/testing';
import LoginPage from 'web/pages/login/LoginPage';

Logger.setDefaultLevel('silent');

const createGmp = ({
  clearToken = testing.fn(),
  login = testing.fn().mockResolvedValue({
    locale: 'locale',
    username: 'username',
    token: 'token',
    timezone: 'timezone',
  }),
  currentSettings = testing.fn().mockResolvedValue({
    data: {
      userinterfacetimeformat: {value: '24h'},
      userinterfacedateformat: {value: 'YYYY-MM-DD'},
    },
  }),
  guestUsername = undefined,
  guestPassword = undefined,
}: {
  clearToken?: () => void;
  login?: (username: string, password: string) => Promise<void>;
  currentSettings?: () => Promise<unknown>;
  guestUsername?: string;
  guestPassword?: string;
} = {}) => ({
  clearToken,
  login,
  settings: {
    guestUsername,
    guestPassword,
  },
  session: createSession({
    timezone: 'UTC',
  }),
  user: {
    currentSettings,
  },
});

describe('LoginPage tests', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });

  test('should render LoginPage', () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);
  });

  test('should allow to login with username and password', () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(gmp.login).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should not display guest login by default', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, store: true});
    render(<LoginPage />);

    expect(screen.queryByTestId('guest-login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-login-button')).not.toBeInTheDocument();
  });

  test('should allow to login as guest', () => {
    const gmp = createGmp({guestUsername: 'foo', guestPassword: 'bar'});
    const {render} = rendererWith({gmp, router: true, store: true});
    render(<LoginPage />);

    const button = screen.getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(gmp.login).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should display error message', async () => {
    const login = testing.fn().mockRejectedValue({message: 'Just a test'});
    const gmp = createGmp({login});
    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    expect(login).toHaveBeenCalledWith('foo', 'bar');

    const error = await screen.findByTestId('error');
    expect(error).toHaveTextContent('Just a test');
  });

  test('should display invalid login message', async () => {
    const login = testing
      .fn()
      .mockRejectedValue(
        new ResponseRejection({status: 401} as XMLHttpRequest),
      );
    const gmp = createGmp({login});
    const {render} = rendererWith({gmp, router: true, store: true});

    render(<LoginPage />);

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    expect(login).toHaveBeenCalledWith('foo', 'bar');

    const error = await screen.findByTestId('error');
    expect(error).toHaveTextContent(
      'Login Failed. Invalid password or username.',
    );
  });

  test('should not clear saved last visited page on login', async () => {
    sessionStorage.clear();

    sessionStorage.setItem('gsa_last_visited_page_foo', '/tasks?filter=open');

    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      token: 'token',
      timezone: 'Europe/Berlin',
      sessionTimeout: '10:00',
    });

    const gmp = createGmp({login});
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

    expect(sessionStorage.getItem('gsa_last_visited_page_foo')).toBe(
      '/tasks?filter=open',
    );
  });

  test('should not clear another user saved page on login', async () => {
    sessionStorage.clear();

    sessionStorage.setItem('gsa_last_visited_page_alice', '/agents');

    const login = testing.fn().mockResolvedValue({
      locale: 'locale',
      token: 'token',
      timezone: 'Europe/Berlin',
      sessionTimeout: '10:00',
    });

    const gmp = createGmp({login});
    const {render} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    render(<LoginPage />);
    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');
    changeInputValue(usernameField, 'bob');
    changeInputValue(passwordField, 'bar');
    const button = screen.getByTestId('login-button');
    fireEvent.click(button);
    await wait();

    expect(sessionStorage.getItem('gsa_last_visited_page_alice')).toBe(
      '/agents',
    );
  });
});
