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

import Gmp from '../gmp';
import DefaultTransform from '../http/transform/default';

describe('Gmp tests', () => {
  beforeAll(() => {
    global.window = {location: {protocol: 'http:'}};
  });

  afterAll(() => {
    global.window = undefined;
  });

  describe('isLoggedIn tests', () => {
    test('should return false if user has no token', () => {
      const gmp = new Gmp();

      expect(gmp.isLoggedIn()).toEqual(false);
    });

    test('should return false if user has empty token', () => {
      const gmp = new Gmp({token: ''});

      expect(gmp.isLoggedIn()).toEqual(false);
    });

    test('should return true if user has token', () => {
      const gmp = new Gmp({token: 'foo'});

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
      const settings = {};

      const http = {
        request,
      };

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
      const settings = {};

      const http = {
        request,
      };

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
      const settings = {token: 'foo'};
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.clearToken();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(settings.token).toBeUndefined();
    });
  });

  describe('logout tests', () => {
    test('should reset token', () => {
      const settings = {token: 'foo'};
      const gmp = new Gmp(settings);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(settings.token).toBeUndefined();
    });

    test('should call logout handlers if logged in', () => {
      const settings = {token: 'foo'};
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
      const settings = {};
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
      const settings = {token: 'foo', apiServer: 'localhost'};

      const http = {
        request,
      };

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
      const settings = {token: 'foo', apiServer: 'localhost'};

      const http = {
        request,
      };

      const handler = testing.fn();

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
      const settings = {
        logLevel: 'silent',
        token: 'foo',
        apiServer: 'localhost',
      };

      const http = {
        request,
      };

      const handler = testing.fn();

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
      const settings = {apiServer: 'localhost'};

      const http = {
        request,
      };

      const handler = testing.fn();

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
