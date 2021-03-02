/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import DefaultTransform from '../http/transform/default';

import Gmp from '../gmp';

describe('Gmp tests', () => {
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
      const request = jest.fn().mockResolvedValue({
        data: {
          token: 'foo',
        },
      });
      const settings = {};

      const http = {
        request,
      };

      const gmp = new Gmp(settings, http);

      return gmp.login.login('foo', 'bar').then(data => {
        expect(request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'login',
            login: 'foo',
            password: 'bar',
          },
        });
        expect(data.token).toEqual('foo');
      });
    });

    test('should not login if request fails', () => {
      const request = jest.fn().mockRejectedValue({
        message: 'An error',
      });
      const settings = {};

      const http = {
        request,
      };

      const gmp = new Gmp(settings, http);

      return gmp.login.login('foo', 'bar').catch(error => {
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
      const handler = jest.fn();
      const unsubscribe = gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(true);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(handler).toHaveBeenCalled();

      unsubscribe();
    });

    test('should call logout handlers if logged out', () => {
      const settings = {};
      const gmp = new Gmp(settings);
      const handler = jest.fn();
      const unsubscribe = gmp.subscribeToLogout(handler);

      expect(gmp.isLoggedIn()).toEqual(false);

      gmp.logout();

      expect(gmp.isLoggedIn()).toEqual(false);
      expect(handler).toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe('doLogout tests', () => {
    test('should logout user', () => {
      const request = jest.fn().mockResolvedValue({
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
      const request = jest.fn().mockResolvedValue({
        data: {},
      });
      const settings = {token: 'foo', apiServer: 'localhost'};

      const http = {
        request,
      };

      const handler = jest.fn();

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
      const request = jest.fn().mockRejectedValue({
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

      const handler = jest.fn();

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
      const request = jest.fn().mockResolvedValue({
        data: {},
      });
      const settings = {apiServer: 'localhost'};

      const http = {
        request,
      };

      const handler = jest.fn();

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
