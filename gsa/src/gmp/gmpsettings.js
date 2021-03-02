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
import {isDefined} from './utils/identity';

export const DEFAULT_GRAPHQL_API_LOCATION = 'selene/graphql/';
export const DEFAULT_RELOAD_INTERVAL = 15 * 1000; // fifteen seconds
export const DEFAULT_RELOAD_INTERVAL_ACTIVE = 3 * 1000; // three seconds
export const DEFAULT_RELOAD_INTERVAL_INACTIVE = 60 * 1000; // one minute
export const DEFAULT_MANUAL_URL =
  'http://docs.greenbone.net/GSM-Manual/gos-20.08/';
export const DEFAULT_PROTOCOLDOC_URL =
  'https://docs.greenbone.net/API/GMP/gmp-20.08.html';
export const DEFAULT_REPORT_RESULTS_THRESHOLD = 25000;
export const DEFAULT_LOG_LEVEL = 'warn';
export const DEFAULT_TIMEOUT = 300000; // 5 minutes

const set = (storage, name, value) => {
  if (isDefined(value)) {
    storage.setItem(name, value);
  } else {
    storage.removeItem(name);
  }
};

const setAndFreeze = (obj, name, value) => {
  Object.defineProperty(obj, name, {
    value: value,
    writable: false,
  });
};

const warnDeprecatedSetting = (oldName, newName) => {
  // eslint-disable-next-line no-console
  console.warn(
    'A deprecated setting',
    oldName,
    'is used. Please use',
    newName,
    'instead.',
  );
};

class GmpSettings {
  constructor(storage = global.localStorage, options = {}) {
    const {
      enableGreenboneSensor = false,
      disableLoginForm = false,
      enableStoreDebugLog,
      guestUsername,
      guestPassword,
      graphqlApiLocation = DEFAULT_GRAPHQL_API_LOCATION,
      loglevel,
      manualUrl = DEFAULT_MANUAL_URL,
      manualLanguageMapping,
      protocol,
      protocolDocUrl = DEFAULT_PROTOCOLDOC_URL,
      reloadInterval = DEFAULT_RELOAD_INTERVAL,
      reloadIntervalActive = DEFAULT_RELOAD_INTERVAL_ACTIVE,
      reloadIntervalInactive = DEFAULT_RELOAD_INTERVAL_INACTIVE,
      reportResultsThreshold = DEFAULT_REPORT_RESULTS_THRESHOLD,
      server,
      timeout = DEFAULT_TIMEOUT,
      vendorVersion,
      vendorLabel,
    } = options;
    let {
      apiProtocol = protocol,
      apiServer = server,
      graphqlApiProtocol,
      graphqlApiServer,
      enableHyperionOnly = false, // default to false if not found in config
      logLevel = loglevel,
    } = options;

    this.storage = storage;

    if (isDefined(loglevel)) {
      warnDeprecatedSetting('loglevel', 'logLevel');
    }
    if (isDefined(server)) {
      warnDeprecatedSetting('server', 'apiServer');
    }
    if (isDefined(protocol)) {
      warnDeprecatedSetting('protocol', 'apiProtocol');
    }

    if (isDefined(enableStoreDebugLog)) {
      this.enableStoreDebugLog = enableStoreDebugLog;
    }

    if (!isDefined(logLevel)) {
      logLevel = storage.logLevel;
    }
    if (!isDefined(logLevel)) {
      logLevel = DEFAULT_LOG_LEVEL;
    }

    if (!isDefined(apiProtocol)) {
      apiProtocol = global.location.protocol;
    }
    if (!isDefined(apiServer)) {
      apiServer = global.location.host;
    }

    if (!isDefined(graphqlApiProtocol)) {
      graphqlApiProtocol = apiProtocol;
    }
    if (!isDefined(graphqlApiServer)) {
      graphqlApiServer = apiServer;
    }

    this.logLevel = logLevel;
    this.reloadInterval = reloadInterval;
    this.reloadIntervalActive = reloadIntervalActive;
    this.reloadIntervalInactive = reloadIntervalInactive;
    this.reportResultsThreshold = reportResultsThreshold;
    this.timeout = timeout;

    setAndFreeze(this, 'apiProtocol', apiProtocol);
    setAndFreeze(this, 'apiServer', apiServer);
    setAndFreeze(this, 'disableLoginForm', disableLoginForm);
    setAndFreeze(this, 'enableGreenboneSensor', enableGreenboneSensor);
    setAndFreeze(this, 'guestUsername', guestUsername);
    setAndFreeze(this, 'guestPassword', guestPassword);
    setAndFreeze(this, 'graphqlApiLocation', graphqlApiLocation);
    setAndFreeze(this, 'graphqlApiProtocol', graphqlApiProtocol);
    setAndFreeze(this, 'graphqlApiServer', graphqlApiServer);
    setAndFreeze(this, 'enableHyperionOnly', enableHyperionOnly);
    setAndFreeze(this, 'manualUrl', manualUrl);
    setAndFreeze(this, 'manualLanguageMapping', manualLanguageMapping);
    setAndFreeze(this, 'protocolDocUrl', protocolDocUrl);
    setAndFreeze(this, 'vendorVersion', vendorVersion);
    setAndFreeze(this, 'vendorLabel', vendorLabel);
  }

  set token(value) {
    set(this.storage, 'token', value);
  }

  get token() {
    return this.storage.token;
  }

  set timezone(value) {
    set(this.storage, 'timezone', value);
  }

  get timezone() {
    return this.storage.timezone;
  }

  set username(value) {
    set(this.storage, 'username', value);
  }

  get username() {
    return this.storage.username;
  }

  set locale(value) {
    set(this.storage, 'locale', value);
  }

  get locale() {
    return this.storage.locale;
  }

  get logLevel() {
    return this.storage.logLevel;
  }

  set logLevel(value) {
    set(this.storage, 'logLevel', value);
  }

  get enableStoreDebugLog() {
    const enabled = this.storage.enableStoreDebugLog;
    if (isDefined(enabled)) {
      return enabled === '1';
    }
    return enabled;
  }

  set enableStoreDebugLog(value) {
    let storeValue;
    if (isDefined(value)) {
      storeValue = value ? '1' : '0';
    }
    set(this.storage, 'enableStoreDebugLog', storeValue);
  }
}

export default GmpSettings;

// vim: set ts=2 sw=2 tw=80:
