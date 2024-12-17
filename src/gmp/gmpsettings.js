/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from './utils/identity';

export const DEFAULT_RELOAD_INTERVAL = 15 * 1000; // fifteen seconds
export const DEFAULT_RELOAD_INTERVAL_ACTIVE = 3 * 1000; // three seconds
export const DEFAULT_RELOAD_INTERVAL_INACTIVE = 60 * 1000; // one minute
export const DEFAULT_MANUAL_URL = `https://docs.greenbone.net/GSM-Manual/gos-22.04/`;
export const DEFAULT_PROTOCOLDOC_URL = `https://docs.greenbone.net/API/GMP/gmp-22.5.html`;
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
      enableEPSS = true,
      enableGreenboneSensor = false,
      disableLoginForm = false,
      enableStoreDebugLog,
      enableAssetManagement = false,
      guestUsername,
      guestPassword,
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

    this.logLevel = logLevel;
    this.reloadInterval = reloadInterval;
    this.reloadIntervalActive = reloadIntervalActive;
    this.reloadIntervalInactive = reloadIntervalInactive;
    this.reportResultsThreshold = reportResultsThreshold;
    this.timeout = timeout;

    setAndFreeze(this, 'apiProtocol', apiProtocol);
    setAndFreeze(this, 'apiServer', apiServer);
    setAndFreeze(this, 'disableLoginForm', disableLoginForm);
    setAndFreeze(this, 'enableEPSS', enableEPSS);
    setAndFreeze(this, 'enableGreenboneSensor', enableGreenboneSensor);
    setAndFreeze(this, 'guestUsername', guestUsername);
    setAndFreeze(this, 'guestPassword', guestPassword);
    setAndFreeze(this, 'manualUrl', manualUrl);
    setAndFreeze(this, 'manualLanguageMapping', manualLanguageMapping);
    setAndFreeze(this, 'protocolDocUrl', protocolDocUrl);
    setAndFreeze(this, 'vendorVersion', vendorVersion);
    setAndFreeze(this, 'vendorLabel', vendorLabel);
    setAndFreeze(this, 'enableAssetManagement', enableAssetManagement);
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
