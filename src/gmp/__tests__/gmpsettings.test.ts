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
import GmpSettings, {
  DEFAULT_MANUAL_URL,
  DEFAULT_RELOAD_INTERVAL,
  DEFAULT_PROTOCOLDOC_URL,
  DEFAULT_LOG_LEVEL,
  DEFAULT_RELOAD_INTERVAL_ACTIVE,
  DEFAULT_RELOAD_INTERVAL_INACTIVE,
  DEFAULT_TIMEOUT,
  DEFAULT_REPORT_RESULTS_THRESHOLD,
  DEFAULT_VENDOR_TITLE
} from 'gmp/gmpsettings';
import {
  DEFAULT_SEVERITY_RATING,
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';

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

describe('GmpSettings tests', () => {
  beforeAll(() => {
    origLocation = global.location;
    // @ts-expect-error
    global.location = {protocol: 'http:', host: 'localhost:9392'};
  });

  afterAll(() => {
    global.location = origLocation;
  });

  test('should init with defaults', () => {
    const storage = createStorage();
    const settings = new GmpSettings(storage);

    expect(settings.apiProtocol).toEqual('http:');
    expect(settings.apiServer).toEqual('localhost:9392');
    expect(settings.disableLoginForm).toEqual(false);
    expect(settings.enableStoreDebugLog).toEqual(false);
    expect(settings.enableAssetManagement).toEqual(false);
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
    expect(settings.severityRating).toEqual(DEFAULT_SEVERITY_RATING);
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toEqual(DEFAULT_TIMEOUT);
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.vendorVersion).toBeUndefined();
    expect(settings.vendorLabel).toBeUndefined();

    expect(settings.vendorTitle).toEqual(DEFAULT_VENDOR_TITLE);

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
      enableAssetManagement: true,
      guestUsername: 'guest',
      guestPassword: 'pass',
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
      severityRating: SEVERITY_RATING_CVSS_3,
      timeout: 30000,
      vendorVersion: 'foo',
      vendorLabel: 'foo.bar',
      vendorTitle: 'test title'
    });

    expect(settings.apiProtocol).toEqual('http');
    expect(settings.apiServer).toEqual('localhost');
    expect(settings.disableLoginForm).toEqual(true);
    expect(settings.enableAssetManagement).toEqual(true);
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
    expect(settings.severityRating).toEqual(SEVERITY_RATING_CVSS_3);
    expect(settings.token).toBeUndefined();
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toBeUndefined();
    expect(settings.username).toBeUndefined();
    expect(settings.vendorVersion).toEqual('foo');
    expect(settings.vendorLabel).toEqual('foo.bar');
    expect(settings.vendorTitle).toEqual('test title');

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
    expect(settings.severityRating).toEqual(DEFAULT_SEVERITY_RATING);
    expect(settings.token).toEqual('atoken');
    expect(settings.timeout).toEqual(DEFAULT_TIMEOUT);
    expect(settings.timezone).toEqual('cet');
    expect(settings.username).toEqual('foo');
    expect(settings.vendorTitle).toEqual(DEFAULT_VENDOR_TITLE);

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
      protocolDocUrl: 'http://lorem',
      reloadInterval: '20',
      reloadIntervalActive: '20',
      reloadIntervalInactive: '20',
      reportResultsThreshold: '500',
      token: 'btoken',
      timeout: '10000',
      timezone: 'cest',
      username: 'bar',
      vendorVersion: 'foo',
      vendorLabel: 'foo.bar',
      vendorTitle: 'test title',
    });
    const settings = new GmpSettings(storage, {
      apiProtocol: 'http',
      apiServer: 'localhost',
      enableStoreDebugLog: true,
      logLevel: 'debug',
      manualUrl: 'http://manual',
      manualLanguageMapping: {foo: 'bar'},
      protocolDocUrl: 'http://protocol',
      reloadInterval: 10,
      reloadIntervalActive: 5,
      reloadIntervalInactive: 60,
      reportResultsThreshold: 10000,
      timeout: 30000,
      vendorVersion: 'bar',
      vendorLabel: 'bar.foo',
      vendorTitle: 'title test',
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
    expect(settings.severityRating).toEqual(DEFAULT_SEVERITY_RATING);
    expect(settings.token).toEqual('btoken');
    expect(settings.timeout).toEqual(30000);
    expect(settings.timezone).toEqual('cest');
    expect(settings.username).toEqual('bar');
    expect(settings.vendorVersion).toEqual('bar');
    expect(settings.vendorLabel).toEqual('bar.foo');
    expect(settings.vendorTitle).toEqual('title test');

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
    expect(settings.vendorTitle).toEqual(DEFAULT_VENDOR_TITLE);

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
      enableAssetManagement: true,
      enableGreenboneSensor: true,
      guestUsername: 'guest',
      guestPassword: 'pass',
      logLevel: 'error',
      manualUrl: 'http://manual',
      manualLanguageMapping: {foo: 'bar'},
      protocolDocUrl: 'http://protocol',
      reloadInterval: 10,
      severityRating: SEVERITY_RATING_CVSS_2,
      timeout: 30000,
      vendorVersion: 'foobar',
      vendorLabel: 'foo.bar',
    });

    expect(() => {
      // @ts-expect-error
      settings.apiServer = 'foo';
    }).toThrow();
    expect(settings.apiServer).toEqual('localhost');
    expect(() => {
      // @ts-expect-error
      settings.apiProtocol = 'foo';
    }).toThrow();
    expect(settings.apiProtocol).toEqual('http');
    expect(() => {
      // @ts-expect-error
      settings.disableLoginForm = false;
    }).toThrow();
    expect(settings.disableLoginForm).toEqual(true);
    expect(() => {
      // @ts-expect-error
      settings.enableAssetManagement = false;
    }).toThrow();
    expect(settings.enableAssetManagement).toEqual(true);
    expect(() => {
      // @ts-expect-error
      settings.enableGreenboneSensor = false;
    }).toThrow();
    expect(settings.enableGreenboneSensor).toEqual(true);
    expect(() => {
      // @ts-expect-error
      settings.guestUsername = 'foo';
    }).toThrow();
    expect(settings.guestUsername).toEqual('guest');
    expect(() => {
      // @ts-expect-error
      settings.guestPassword = 'foo';
    }).toThrow();
    expect(settings.guestPassword).toEqual('pass');
    expect(() => {
      // @ts-expect-error
      settings.manualUrl = 'foo';
    }).toThrow();
    expect(settings.manualUrl).toEqual('http://manual');
    expect(() => {
      // @ts-expect-error
      settings.manualLanguageMapping = {lorem: 'ipsum'};
    }).toThrow();
    expect(settings.manualLanguageMapping).toEqual({foo: 'bar'});
    expect(() => {
      // @ts-expect-error
      settings.protocolDocUrl = 'foo';
    }).toThrow();
    expect(settings.severityRating).toEqual(SEVERITY_RATING_CVSS_2);
    expect(() => {
      // @ts-expect-error
      settings.severityRating = 'foo';
    }).toThrow();
    expect(settings.protocolDocUrl).toEqual('http://protocol');
    expect(() => {
      // @ts-expect-error
      settings.vendorVersion = 'barfoo';
    }).toThrow();
    expect(settings.vendorVersion).toEqual('foobar');
    expect(() => {
      // @ts-expect-error
      settings.vendorLabel = 'bar.foo';
    }).toThrow();
    expect(settings.vendorLabel).toEqual('foo.bar');
  });

  test('should only allow setting severity rating to CVSS 2 or 3', () => {
    const storage = createStorage();
    let settings = new GmpSettings(storage, {
      // @ts-expect-error
      severityRating: 'foo',
    });
    expect(settings.severityRating).toEqual(DEFAULT_SEVERITY_RATING);

    settings = new GmpSettings(storage, {
      severityRating: SEVERITY_RATING_CVSS_2,
    });
    expect(settings.severityRating).toEqual(SEVERITY_RATING_CVSS_2);

    settings = new GmpSettings(storage, {
      severityRating: SEVERITY_RATING_CVSS_3,
    });
    expect(settings.severityRating).toEqual(SEVERITY_RATING_CVSS_3);
  });
});
