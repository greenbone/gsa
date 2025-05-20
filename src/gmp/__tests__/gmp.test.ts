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
import Gmp from 'gmp/gmp';
import GmpSettings from 'gmp/gmpsettings';
import GmpHttp from 'gmp/http/gmp';
import DefaultTransform from 'gmp/http/transform/default';

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
    origLocation = global.location;
    // @ts-expect-error
    global.location = {protocol: 'http:', host: 'localhost:9392'};
  });

  afterAll(() => {
    global.location = origLocation;
  });

  describe('isLoggedIn tests', () => {
    test('should return false if user has no token', () => {
      const storage = createStorage();
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(false);
    });

    test('should return false if user has empty token', () => {
      const storage = createStorage({token: ''});
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(false);
    });

    test('should return true if user has token', () => {
      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(true);
    });
  });

  describe('login tests', () => {
    test('should login user', () => {
      const request = testing.fn().mockResolvedValue({
        data: {
          token: 'foo',
        },
      });
      const http = {
        request,
      } as unknown as GmpHttp;

      const storage = createStorage();
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings, http);

      return gmp.login('foo', 'bar').then(() => {
        expect(request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'login',
            login: 'foo',
            password: 'bar',
          },
        });
        expect(gmp.isLoggedIn()).toEqual(true);
      });
    });

    test('should not login if request fails', () => {
      const request = testing.fn().mockRejectedValue({
        message: 'An error',
      });
      const http = {
        request,
      } as unknown as GmpHttp;

      const storage = createStorage();
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings, http);

      return gmp.login('foo', 'bar').catch(error => {
        expect(request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'login',
            login: 'foo',
            password: 'bar',
          },
        });
        expect(error.message).toEqual('An error');
        expect(gmp.isLoggedIn()).toEqual(false);
      });
    });
  });

  describe('clearToken tests', () => {
    test('should reset token', () => {
      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.clearToken();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(settings.token).toBeUndefined();
    });
  });

  describe('logout tests', () => {
    test('should reset token', () => {
      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(settings.token).toBeUndefined();
    });

    test('should call logout handlers if logged in', () => {
      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);
      const handler = testing.fn();
      const unsub = gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(handler).toHaveBeenCalled();

      unsub();
    });

    test('should call logout handlers if logged out', () => {
      const storage = createStorage();
      const settings = new GmpSettings(storage);
      const gmp = new Gmp(settings);
      const handler = testing.fn();
      const unsub = gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(false);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(handler).toHaveBeenCalled();

      unsub();
    });
  });

  describe('doLogout tests', () => {
    test('should logout user', () => {
      const request = testing.fn().mockResolvedValue({
        data: {
          token: 'foo',
        },
      });
      const http = {
        request,
      } as unknown as GmpHttp;

      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage, {apiServer: 'localhost'});
      const gmp = new Gmp(settings, http);

      expect(gmp.isLoggedIn()).toEqual(true);

      return gmp.doLogout().then(() => {
        expect(request).toHaveBeenCalledWith('get', {
          args: {
            token: 'foo',
          },
          transform: DefaultTransform,
          url: 'http://localhost/logout',
        });
        expect(gmp.isLoggedIn()).toEqual(false);
        expect(settings.token).toBeUndefined();
      });
    });

    test('should notify handler on logout success', () => {
      const request = testing.fn().mockResolvedValue({
        data: {},
      });
      const http = {
        request,
      } as unknown as GmpHttp;
      const handler = testing.fn();

      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage, {apiServer: 'localhost'});
      const gmp = new Gmp(settings, http);

      gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(true);

      return gmp.doLogout().then(() => {
        expect(gmp.isLoggedIn()).toEqual(false);
        expect(settings.token).toBeUndefined();
        expect(handler).toHaveBeenCalled();
      });
    });

    test('should ignore logout api call failure', () => {
      const request = testing.fn().mockRejectedValue({
        message: 'foo',
      });
      const http = {
        request,
      } as unknown as GmpHttp;
      const handler = testing.fn();

      const storage = createStorage({token: 'foo'});
      const settings = new GmpSettings(storage, {
        apiServer: 'localhost',
        logLevel: 'silent',
      });
      const gmp = new Gmp(settings, http);

      gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(true);

      return gmp.doLogout().then(() => {
        expect(gmp.isLoggedIn()).toEqual(false);
        expect(settings.token).toBeUndefined();
        expect(handler).toHaveBeenCalled();
      });
    });

    test('should not do logout if not logged int', () => {
      const request = testing.fn().mockResolvedValue({
        data: {},
      });
      const http = {
        request,
      } as unknown as GmpHttp;
      const handler = testing.fn();

      const storage = createStorage();
      const settings = new GmpSettings(storage, {apiServer: 'localhost'});
      const gmp = new Gmp(settings, http);

      gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(false);

      return gmp.doLogout().then(() => {
        expect(gmp.isLoggedIn()).toEqual(false);
        expect(settings.token).toBeUndefined();
        expect(handler).not.toHaveBeenCalled();
      });
    });
  });
});
