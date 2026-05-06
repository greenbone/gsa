/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  testing,
} from '@gsa/testing';
import {
  createHttp,
  createHttpError,
  createResponse,
} from 'gmp/commands/testing';
import Gmp from 'gmp/gmp';
import Settings from 'gmp/settings';

const createStorage = (state?: Record<string, string>) => {
  const store = {
    state: {...state},
    getItem: testing.fn(name => store.state[name] || null),
    setItem: testing.fn((name, value) => (store.state[name] = String(value))),
    removeItem: testing.fn(name => delete store.state[name]),
  };
  return store;
};

let origLocation: Location;

describe('Gmp tests', () => {
  beforeAll(() => {
    origLocation = globalThis.location;
    // @ts-expect-error
    globalThis.location = {protocol: 'http:', host: 'localhost:9392'};
  });

  afterAll(() => {
    globalThis.location = origLocation;
  });

  test('should login user', async () => {
    const http = createHttp(createResponse({token: 'foo'}));

    const storage = createStorage();
    const settings = new Settings(storage);
    const gmp = new Gmp(settings, http);

    await gmp.login('foo', 'bar');
    expect(http.request).toHaveBeenCalledWith(
      'post',
      expect.objectContaining({
        data: {
          cmd: 'login',
          login: 'foo',
          password: 'bar',
        },
      }),
    );
    expect(settings.session.isLoggedIn()).toEqual(true);
  });

  test('should not login if request fails', async () => {
    const http = createHttpError(new Error('An error'));
    const storage = createStorage();
    const settings = new Settings(storage);
    const gmp = new Gmp(settings, http);

    try {
      return await gmp.login('foo', 'bar');
    } catch (error) {
      expect(http.request).toHaveBeenCalledWith(
        'post',
        expect.objectContaining({
          data: {
            cmd: 'login',
            login: 'foo',
            password: 'bar',
          },
        }),
      );
      expect((error as Error).message).toEqual('An error');
      expect(settings.session.isLoggedIn()).toEqual(false);
    }
  });

  test('should reset token on logout', () => {
    const storage = createStorage();
    const settings = new Settings(storage);
    settings.session.login({token: 'foo'});
    const gmp = new Gmp(settings);

    expect(settings.session.isLoggedIn()).toEqual(true);

    gmp.logout();

    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(settings.session.token).toBeUndefined();
  });

  test('should call logout handlers after logout if logged in', () => {
    const storage = createStorage();
    const settings = new Settings(storage);
    settings.session.login({token: 'foo'});
    const gmp = new Gmp(settings);
    const handler = testing.fn();
    const unsub = gmp.subscribeToLogout(handler);

    expect(settings.session.isLoggedIn()).toEqual(true);

    gmp.logout();

    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(handler).toHaveBeenCalled();

    unsub();
  });

  test('should call logout handlers after logout if logged out', () => {
    const storage = createStorage();
    const settings = new Settings(storage);
    const gmp = new Gmp(settings);
    const handler = testing.fn();
    const unsub = gmp.subscribeToLogout(handler);

    expect(settings.session.isLoggedIn()).toEqual(false);

    gmp.logout();

    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(handler).toHaveBeenCalled();

    unsub();
  });

  test('should do logout user', async () => {
    const http = createHttp(createResponse());
    const storage = createStorage({token: 'foo'});
    const settings = new Settings(storage, {apiServer: 'localhost'});
    settings.session.login({token: 'foo'});
    const gmp = new Gmp(settings, http);

    expect(settings.session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        token: 'foo',
      },
      url: 'http://localhost/logout',
    });
    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(settings.session.token).toBeUndefined();
  });

  test('should notify handler on do logout success', async () => {
    const http = createHttp(createResponse({}));
    const handler = testing.fn();

    const storage = createStorage();
    const settings = new Settings(storage, {apiServer: 'localhost'});
    settings.session.login({token: 'foo'});
    const gmp = new Gmp(settings, http);

    gmp.subscribeToLogout(handler);

    expect(settings.session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();
    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(settings.session.token).toBeUndefined();
    expect(handler).toHaveBeenCalled();
  });

  test('should ignore do logout api call failure', async () => {
    const http = createHttpError(new Error('An error'));
    const handler = testing.fn();

    const storage = createStorage();
    const settings = new Settings(storage, {
      apiServer: 'localhost',
      logLevel: 'silent',
    });
    settings.session.login({token: 'foo'});
    const gmp = new Gmp(settings, http);

    gmp.subscribeToLogout(handler);

    expect(settings.session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();
    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(settings.session.token).toBeUndefined();
    expect(handler).toHaveBeenCalled();
  });

  test('should not do logout if not logged int', async () => {
    const http = createHttp(createResponse({}));
    const handler = testing.fn();

    const storage = createStorage();
    const settings = new Settings(storage, {apiServer: 'localhost'});
    const gmp = new Gmp(settings, http);

    gmp.subscribeToLogout(handler);

    expect(settings.session.isLoggedIn()).toEqual(false);

    await gmp.doLogout();
    expect(settings.session.isLoggedIn()).toEqual(false);
    expect(settings.session.token).toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });
});
