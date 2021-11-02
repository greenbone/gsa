/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import GmpSettings, {
  DEFAULT_MANUAL_URL,
  DEFAULT_RELOAD_INTERVAL,
  DEFAULT_PROTOCOLDOC_URL,
  DEFAULT_LOG_LEVEL,
  DEFAULT_RELOAD_INTERVAL_ACTIVE,
  DEFAULT_RELOAD_INTERVAL_INACTIVE,
  DEFAULT_TIMEOUT,
  DEFAULT_REPORT_RESULTS_THRESHOLD,
} from 'gmp/gmpsettings';

const createStorage = state => {
  const store = {
    ...state,
    setItem: jest.fn((name, value) => (store[name] = '' + value)),
    removeItem: jest.fn(name => delete store[name]),
  };
  return store;
};

describe('GmpSettings tests', () => {
  test('should init with defaults', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage);

    expect(settings.apiProtocol).toEqual('http:');
    expect(settings.apiServer).toEqual('localhost');
    expect(settings.disableLoginForm).toEqual(false);
    expect(settings.enableStoreDebugLog).toBeUndefined();
    expect(settings.guestUsername).toBeUndefined();
    expect(settings.guestPassword).toBeUndefined();
    expect(settings.logLevel).toEqual(DEFAULT_LOG_LEVEL);
    expect(settings.locale).toBeUndefined();
    expect(settings.manualUrl).toEqual(DEFAULT_MANUAL_URL);
    expect(settings.manualLanguageMapping).toBeUndefined();
    expect(settings.protocolDocUrl).toEqual(DEFAULT_PROTOCOLDOC_URL);
    expect(settings.reloadInterval).toEqual(DEFAULT_RELOAD_INTERVAL);
    expect(settings.reloadIntervalActive).toEqual(
      DEFAULT_RELOAD_INTERVAL_ACTIVE,
    );
    expect(settings.reloadIntervalInactive).toEqual(
      DEFAULT_RELOAD_INTERVAL_INACTIVE,
    );
    expect(settings.reportResultsThreshold).toEqual(
      DEFAULT_REPORT_RESULTS_THRESHOLD,
    );
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toEqual(DEFAULT_TIMEOUT);
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.vendorVersion).toBeUndefined();
    expect(settings.vendorLabel).toBeUndefined();

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('logLevel', DEFAULT_LOG_LEVEL);
  });

  test('should init with passed options', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage, {
      apiProtocol: 'http',
      apiServer: 'localhost',
      disableLoginForm: true,
      enableGreenboneSensor: true,
      enableStoreDebugLog: true,
      guestUsername: 'guest',
      guestPassword: 'pass',
      locale: 'en',
      logLevel: 'error',
      manualUrl: 'http://manual',
      manualLanguageMapping: {
        foo: 'bar',
      },
      protocolDocUrl: 'http://protocol',
      reloadInterval: 10,
      reloadIntervalActive: 5,
      reloadIntervalInactive: 60,
      reportResultsThreshold: 10000,
      token: 'atoken',
      timeout: 30000,
      timezone: 'cet',
      username: 'foo',
      vendorVersion: 'foo',
      vendorLabel: 'foo.bar',
    });

    expect(settings.apiProtocol).toEqual('http');
    expect(settings.apiServer).toEqual('localhost');
    expect(settings.disableLoginForm).toEqual(true);
    expect(settings.enableGreenboneSensor).toEqual(true);
    expect(settings.enableStoreDebugLog).toEqual(true);
    expect(settings.guestUsername).toEqual('guest');
    expect(settings.guestPassword).toEqual('pass');
    expect(settings.locale).toBeUndefined();
    expect(settings.logLevel).toEqual('error');
    expect(settings.manualUrl).toEqual('http://manual');
    expect(settings.manualLanguageMapping).toEqual({foo: 'bar'});
    expect(settings.protocolDocUrl).toEqual('http://protocol');
    expect(settings.reloadInterval).toEqual(10);
    expect(settings.reloadIntervalActive).toEqual(5);
    expect(settings.reloadIntervalInactive).toEqual(60);
    expect(settings.reportResultsThreshold).toEqual(10000);
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.vendorVersion).toEqual('foo');
    expect(settings.vendorLabel).toEqual('foo.bar');

    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      'enableStoreDebugLog',
      '1',
    );
    expect(storage.setItem).toHaveBeenNthCalledWith(2, 'logLevel', 'error');
  });

  test('should init from store', () => {
    const storage = createStorage({
      enableStoreDebugLog: '0',
      locale: 'en',
      logLevel: 'error',
      timezone: 'cet',
      token: 'atoken',
      username: 'foo',
    });

    const settings = new GmpSettings(storage, {
      // pass server and protocol. location defaults may not reliable on
      // different test environments
      apiProtocol: 'http',
      apiServer: 'foo',
    });

    expect(settings.apiProtocol).toEqual('http');
    expect(settings.apiServer).toEqual('foo');
    expect(settings.enableGreenboneSensor).toEqual(false);
    expect(settings.enableStoreDebugLog).toEqual(false);
    expect(settings.locale).toEqual('en');
    expect(settings.logLevel).toEqual('error');
    expect(settings.manualUrl).toEqual(DEFAULT_MANUAL_URL);
    expect(settings.manualLanguageMapping).toBeUndefined();
    expect(settings.protocolDocUrl).toEqual(DEFAULT_PROTOCOLDOC_URL);
    expect(settings.reloadInterval).toEqual(DEFAULT_RELOAD_INTERVAL);
    expect(settings.reloadIntervalActive).toEqual(
      DEFAULT_RELOAD_INTERVAL_ACTIVE,
    );
    expect(settings.reloadIntervalInactive).toEqual(
      DEFAULT_RELOAD_INTERVAL_INACTIVE,
    );
    expect(settings.reportResultsThreshold).toEqual(
      DEFAULT_REPORT_RESULTS_THRESHOLD,
    );
    expect(settings.token).toEqual('atoken');
    expect(settings.timeout).toEqual(DEFAULT_TIMEOUT);
    expect(settings.timezone).toEqual('cet');
    expect(settings.username).toEqual('foo');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('logLevel', 'error');
  });

  test('should ensure options override settings from storage', () => {
    const storage = createStorage({
      apiProtocol: 'https',
      apiServer: 'foo.bar',
      enableStoreDebugLog: '0',
      locale: 'de',
      logLevel: 'error',
      manualUrl: 'http://ipsum',
      manualLanguageMapping: {lorem: 'ipsum'},
      protocolDocUrl: 'http://lorem',
      reloadInterval: 20,
      reloadIntervalActive: 20,
      reloadIntervalInactive: 20,
      reportResultsThreshold: 500,
      token: 'btoken',
      timeout: 10000,
      timezone: 'cest',
      username: 'bar',
      vendorVersion: 'foo',
      vendorLabel: 'foo.bar',
    });

    const settings = new GmpSettings(storage, {
      apiProtocol: 'http',
      apiServer: 'localhost',
      enableStoreDebugLog: true,
      locale: 'en',
      logLevel: 'debug',
      manualUrl: 'http://manual',
      manualLanguageMapping: {foo: 'bar'},
      protocolDocUrl: 'http://protocol',
      reloadInterval: 10,
      reloadIntervalActive: 5,
      reloadIntervalInactive: 60,
      reportResultsThreshold: 10000,
      token: 'atoken',
      timeout: 30000,
      timezone: 'cet',
      username: 'foo',
      vendorVersion: 'bar',
      vendorLabel: 'bar.foo',
    });

    expect(settings.apiProtocol).toEqual('http');
    expect(settings.apiServer).toEqual('localhost');
    expect(settings.enableStoreDebugLog).toEqual(true);
    expect(settings.locale).toEqual('de');
    expect(settings.logLevel).toEqual('debug');
    expect(settings.manualUrl).toEqual('http://manual');
    expect(settings.manualLanguageMapping).toEqual({foo: 'bar'});
    expect(settings.protocolDocUrl).toEqual('http://protocol');
    expect(settings.reloadInterval).toEqual(10);
    expect(settings.reloadIntervalActive).toEqual(5);
    expect(settings.reloadIntervalInactive).toEqual(60);
    expect(settings.reportResultsThreshold).toEqual(10000);
    expect(settings.token).toEqual('btoken');
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toEqual('cest');
    expect(settings.username).toEqual('bar');
    expect(settings.vendorVersion).toEqual('bar');
    expect(settings.vendorLabel).toEqual('bar.foo');

    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(storage.setItem).toHaveBeenNthCalledWith(
      1,
      'enableStoreDebugLog',
      '1',
    );
    expect(storage.setItem).toHaveBeenNthCalledWith(2, 'logLevel', 'debug');
  });

  test('should delete settings from storage', () => {
    const storage = createStorage({
      enableStoreDebugLog: '1',
      locale: 'en',
      logLevel: 'error',
      token: 'atoken',
      timezone: 'cet',
      username: 'foo',
    });

    const settings = new GmpSettings(storage, {});

    expect(settings.enableStoreDebugLog).toEqual(true);
    expect(settings.locale).toEqual('en');
    expect(settings.logLevel).toEqual('error');
    expect(settings.token).toEqual('atoken');
    expect(settings.timezone).toEqual('cet');
    expect(settings.username).toEqual('foo');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith('logLevel', 'error');

    settings.enableStoreDebugLog = undefined;
    expect(storage.removeItem).toBeCalledWith('enableStoreDebugLog');

    settings.locale = undefined;
    expect(storage.removeItem).toBeCalledWith('locale');

    settings.logLevel = undefined;
    expect(storage.removeItem).toBeCalledWith('logLevel');

    settings.token = undefined;
    expect(storage.removeItem).toBeCalledWith('token');

    settings.timezone = undefined;
    expect(storage.removeItem).toBeCalledWith('timezone');

    settings.username = undefined;
    expect(storage.removeItem).toBeCalledWith('username');
  });

  test('should freeze properties', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage, {
      apiProtocol: 'http',
      apiServer: 'localhost',
      disableLoginForm: true,
      enableGreenboneSensor: true,
      guestUsername: 'guest',
      guestPassword: 'pass',
      locale: 'en',
      logLevel: 'error',
      manualUrl: 'http://manual',
      manualLanguageMapping: {foo: 'bar'},
      protocolDocUrl: 'http://protocol',
      reloadInterval: 10,
      token: 'atoken',
      timeout: 30000,
      timezone: 'cet',
      username: 'foo',
      vendorVersion: 'foobar',
      vendorLabel: 'foo.bar',
    });

    expect(() => {
      settings.apiServer = 'foo';
    }).toThrow();
    expect(settings.apiServer).toEqual('localhost');
    expect(() => {
      settings.apiProtocol = 'foo';
    }).toThrow();
    expect(settings.apiProtocol).toEqual('http');
    expect(() => {
      settings.disableLoginForm = false;
    }).toThrow();
    expect(settings.disableLoginForm).toEqual(true);
    expect(() => {
      settings.enableGreenboneSensor = false;
    }).toThrow();
    expect(settings.enableGreenboneSensor).toEqual(true);
    expect(() => {
      settings.guestUsername = 'foo';
    }).toThrow();
    expect(settings.guestUsername).toEqual('guest');
    expect(() => {
      settings.guestPassword = 'foo';
    }).toThrow();
    expect(settings.guestPassword).toEqual('pass');
    expect(() => {
      settings.manualUrl = 'foo';
    }).toThrow();
    expect(settings.manualUrl).toEqual('http://manual');
    expect(() => {
      settings.manualLanguageMapping = {lorem: 'ipsum'};
    }).toThrow();
    expect(settings.manualLanguageMapping).toEqual({foo: 'bar'});
    expect(() => {
      settings.protocolDocUrl = 'foo';
    }).toThrow();
    expect(settings.protocolDocUrl).toEqual('http://protocol');
    expect(() => {
      settings.vendorVersion = 'barfoo';
    }).toThrow();
    expect(settings.vendorVersion).toEqual('foobar');
    expect(() => {
      settings.vendorLabel = 'bar.foo';
    }).toThrow();
    expect(settings.vendorLabel).toEqual('foo.bar');
  });
});

// vim: set ts=2 sw=2 tw=80:
