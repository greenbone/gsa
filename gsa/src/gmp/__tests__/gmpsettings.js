/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import GmpSettings, {
  DEFAULT_MANUAL_URL,
  DEFAULT_RELOAD_INTERVAL,
  DEFAULT_PROTOCOLDOC_URL,
  DEFAULT_LOG_LEVEL,
} from 'gmp/gmpsettings';

const createStorage = state => {
  const store = {
    ...state,
    setItem: jest.fn((name, value) => (store[name] = value)),
    removeItem: jest.fn(name => delete store[name]),
  };
  return store;
};

describe('GmpSettings tests', () => {
  test('should init with defaults', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage);
    expect(settings.loglevel).toEqual(DEFAULT_LOG_LEVEL);
    expect(settings.reloadinterval).toEqual(DEFAULT_RELOAD_INTERVAL);
    expect(settings.locale).toBeUndefined();
    expect(settings.manualurl).toEqual(DEFAULT_MANUAL_URL);
    expect(settings.protocol).toEqual('http:');
    expect(settings.protocoldocurl).toEqual(DEFAULT_PROTOCOLDOC_URL);
    expect(settings.server).toEqual('localhost');
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toBeUndefined();
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.guestUsername).toBeUndefined();
    expect(settings.guestPassword).toBeUndefined();
    expect(settings.disableLoginForm).toEqual(false);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('loglevel', DEFAULT_LOG_LEVEL);
  });

  test('should init with passed options', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage, {
      reloadinterval: 10,
      locale: 'en',
      loglevel: 'error',
      manualurl: 'http://manual',
      protocol: 'http',
      protocoldocurl: 'http://protocol',
      server: 'localhost',
      token: 'atoken',
      timeout: 30000,
      timezone: 'cet',
      username: 'foo',
      guestUsername: 'guest',
      guestPassword: 'pass',
      disableLoginForm: true,
    });

    expect(settings.reloadinterval).toEqual(10);
    expect(settings.locale).toBeUndefined();
    expect(settings.manualurl).toEqual('http://manual');
    expect(settings.protocol).toEqual('http');
    expect(settings.protocoldocurl).toEqual('http://protocol');
    expect(settings.server).toEqual('localhost');
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.loglevel).toEqual('error');

    expect(settings.guestUsername).toEqual('guest');
    expect(settings.guestPassword).toEqual('pass');
    expect(settings.disableLoginForm).toEqual(true);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('loglevel', 'error');
  });

  test('should init from store', () => {
    const storage = createStorage({
      locale: 'en',
      token: 'atoken',
      timezone: 'cet',
      username: 'foo',
      loglevel: 'error',
    });

    const settings = new GmpSettings(storage, {
      // pass server and protocol. location defaults may not reliable on
      // different test environments
      server: 'foo',
      protocol: 'http',
    });

    expect(settings.reloadinterval).toEqual(DEFAULT_RELOAD_INTERVAL);
    expect(settings.locale).toEqual('en');
    expect(settings.manualurl).toEqual(DEFAULT_MANUAL_URL);
    expect(settings.protocol).toEqual('http');
    expect(settings.protocoldocurl).toEqual(DEFAULT_PROTOCOLDOC_URL);
    expect(settings.server).toEqual('foo');
    expect(settings.token).toEqual('atoken');
    expect(settings.timeout).toBeUndefined();
    expect(settings.timezone).toEqual('cet');
    expect(settings.username).toEqual('foo');
    expect(settings.loglevel).toEqual('error');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('loglevel', 'error');
  });

  test('should ensure options override settings from storage', () => {
    const storage = createStorage({
      reloadinterval: 20,
      locale: 'de',
      manualurl: 'http://ipsum',
      protocol: 'https',
      protocoldocurl: 'http://lorem',
      server: 'foo.bar',
      token: 'btoken',
      timeout: 10000,
      timezone: 'cest',
      username: 'bar',
      loglevel: 'error',
    });

    const settings = new GmpSettings(storage, {
      reloadinterval: 10,
      locale: 'en',
      manualurl: 'http://manual',
      protocol: 'http',
      protocoldocurl: 'http://protocol',
      server: 'localhost',
      token: 'atoken',
      timeout: 30000,
      timezone: 'cet',
      username: 'foo',
      loglevel: 'debug',
    });

    expect(settings.reloadinterval).toEqual(10);
    expect(settings.locale).toEqual('de');
    expect(settings.manualurl).toEqual('http://manual');
    expect(settings.protocol).toEqual('http');
    expect(settings.protocoldocurl).toEqual('http://protocol');
    expect(settings.server).toEqual('localhost');
    expect(settings.token).toEqual('btoken');
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toEqual('cest');
    expect(settings.username).toEqual('bar');
    expect(settings.loglevel).toEqual('debug');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('loglevel', 'debug');
  });

  test('should delete settings from storage', () => {
    const storage = createStorage({
      locale: 'en',
      token: 'atoken',
      timezone: 'cet',
      username: 'foo',
      loglevel: 'error',
    });

    const settings = new GmpSettings(storage, {});

    expect(settings.locale).toEqual('en');
    expect(settings.token).toEqual('atoken');
    expect(settings.timezone).toEqual('cet');
    expect(settings.username).toEqual('foo');
    expect(settings.loglevel).toEqual('error');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('loglevel', 'error');

    settings.locale = undefined;
    expect(storage.removeItem).toBeCalledWith('locale');

    settings.token = undefined;
    expect(storage.removeItem).toBeCalledWith('token');

    settings.timezone = undefined;
    expect(storage.removeItem).toBeCalledWith('timezone');

    settings.username = undefined;
    expect(storage.removeItem).toBeCalledWith('username');

    settings.loglevel = undefined;
    expect(storage.removeItem).toBeCalledWith('loglevel');
  });
});

// vim: set ts=2 sw=2 tw=80:
