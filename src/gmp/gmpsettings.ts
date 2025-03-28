/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined} from 'gmp/utils/identity';

export const DEFAULT_RELOAD_INTERVAL = 15 * 1000; // fifteen seconds
export const DEFAULT_RELOAD_INTERVAL_ACTIVE = 3 * 1000; // three seconds
export const DEFAULT_RELOAD_INTERVAL_INACTIVE = 60 * 1000; // one minute
export const DEFAULT_MANUAL_URL = `https://docs.greenbone.net/GSM-Manual/gos-24.10/`;
export const DEFAULT_PROTOCOLDOC_URL = `https://docs.greenbone.net/API/GMP/gmp-22.5.html`;
export const DEFAULT_REPORT_RESULTS_THRESHOLD = 25000;
export const DEFAULT_LOG_LEVEL = 'warn';
export const DEFAULT_TIMEOUT = 300000; // 5 minutes

interface GmpSettingsOptions {
  apiProtocol?: string;
  apiServer?: string;
  enableEPSS?: boolean;
  enableKrb5?: boolean;
  enableGreenboneSensor?: boolean;
  disableLoginForm?: boolean;
  enableStoreDebugLog?: boolean;
  enableAssetManagement?: boolean;
  guestUsername?: string;
  guestPassword?: string;
  loglevel?: string;
  logLevel?: string;
  manualUrl?: string;
  manualLanguageMapping?: LanguageMapping;
  protocol?: string;
  protocolDocUrl?: string;
  reloadInterval?: number;
  reloadIntervalActive?: number;
  reloadIntervalInactive?: number;
  reportResultsThreshold?: number;
  server?: string;
  timeout?: number;
  vendorVersion?: string;
  vendorLabel?: string;
}

interface GmpSettingsStorage {
  setItem(name: string, value: string): void;
  getItem(name: string): string | null;
  removeItem(name: string): void;
}

interface LanguageMapping {
  [key: string]: string;
}

const set = (
  storage: GmpSettingsStorage,
  name: string,
  value: string | undefined,
) => {
  if (isDefined(value)) {
    storage.setItem(name, value);
  } else {
    storage.removeItem(name);
  }
};

const setAndFreeze = (
  obj: object,
  name: string,
  value: string | number | boolean | object | undefined,
) => {
  Object.defineProperty(obj, name, {
    value: value,
    writable: false,
  });
};

const warnDeprecatedSetting = (oldName: string, newName: string) => {
  console.warn(
    'A deprecated setting',
    oldName,
    'is used. Please use',
    newName,
    'instead.',
  );
};

class GmpSettings {
  storage: GmpSettingsStorage;
  reloadInterval: number;
  reloadIntervalActive: number;
  reloadIntervalInactive: number;
  reportResultsThreshold: number;
  timeout: number;
  readonly apiProtocol!: string;
  readonly apiServer!: string;
  readonly disableLoginForm!: boolean;
  readonly enableEPSS!: boolean;
  readonly enableKrb5!: boolean;
  readonly enableGreenboneSensor!: boolean;
  readonly guestUsername!: string;
  readonly guestPassword!: string;
  readonly manualUrl!: string;
  readonly manualLanguageMapping!: LanguageMapping;
  readonly protocolDocUrl!: string;
  readonly vendorVersion!: string;
  readonly vendorLabel!: string;
  readonly enableAssetManagement!: boolean;

  constructor(
    storage: GmpSettingsStorage = global.localStorage,
    options: GmpSettingsOptions = {},
  ) {
    const {
      enableEPSS = true,
      enableKrb5 = false,
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
      // @ts-expect-error
      logLevel = storage.getItem('logLevel');
    }
    if (!hasValue(logLevel)) {
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
    setAndFreeze(this, 'enableKrb5', enableKrb5);
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

  set token(value: string | undefined) {
    set(this.storage, 'token', value);
  }

  get token(): string | undefined {
    return this.storage.getItem('token') || undefined;
  }

  set timezone(value: string | undefined) {
    set(this.storage, 'timezone', value);
  }

  get timezone(): string | undefined {
    return this.storage.getItem('timezone') || undefined;
  }

  set username(value: string | undefined) {
    set(this.storage, 'username', value);
  }

  get username(): string | undefined {
    return this.storage.getItem('username') || undefined;
  }

  set locale(value: string | undefined) {
    set(this.storage, 'locale', value);
  }

  get locale(): string | undefined {
    return this.storage.getItem('locale') || undefined;
  }

  get logLevel(): string {
    return this.storage.getItem('logLevel') as string;
  }

  set logLevel(value: string | undefined) {
    set(this.storage, 'logLevel', value);
  }

  get enableStoreDebugLog(): boolean {
    const enabled = this.storage.getItem('enableStoreDebugLog');
    return enabled === '1';
  }

  set enableStoreDebugLog(value: boolean | undefined) {
    let storeValue: string | undefined;
    if (isDefined(value)) {
      storeValue = value ? '1' : '0';
    }
    set(this.storage, 'enableStoreDebugLog', storeValue);
  }
}

export default GmpSettings;
