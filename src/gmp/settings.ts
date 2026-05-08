/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined} from 'gmp/utils/identity';
import {
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
  DEFAULT_SEVERITY_RATING,
  type SeverityRating,
} from 'gmp/utils/severity';

interface SettingsOptions {
  apiProtocol?: string;
  apiServer?: string;
  disableLoginForm?: boolean;
  enableAssetManagement?: boolean;
  enableCommunityFeedNotification?: boolean;
  enableEPSS?: boolean;
  enableGreenboneSensor?: boolean;
  enableKrb5?: boolean;
  enableStoreDebugLog?: boolean;
  guestPassword?: string;
  guestUsername?: string;
  loglevel?: string;
  logLevel?: string;
  manualLanguageMapping?: LanguageMapping;
  manualUrl?: string;
  protocol?: string;
  protocolDocUrl?: string;
  reloadInterval?: number;
  reloadIntervalActive?: number;
  reloadIntervalInactive?: number;
  reportResultsThreshold?: number;
  server?: string;
  severityRating?: SeverityRating;
  timeout?: number;
  vendorLabel?: string;
  vendorTitle?: string;
  vendorVersion?: string;
}

interface SettingsStorage {
  setItem(name: string, value: string): void;
  getItem(name: string): string | null;
  removeItem(name: string): void;
}

interface LanguageMapping {
  [key: string]: string;
}

export const DEFAULT_RELOAD_INTERVAL = 15 * 1000; // fifteen seconds
export const DEFAULT_RELOAD_INTERVAL_ACTIVE = 3 * 1000; // three seconds
export const DEFAULT_RELOAD_INTERVAL_INACTIVE = 60 * 1000; // one minute
export const DEFAULT_MANUAL_URL = `https://docs.greenbone.net/GSM-Manual/gos-25.0/`;
export const DEFAULT_PROTOCOLDOC_URL = `https://docs.greenbone.net/API/GMP/gmp-22.5.html`;
export const DEFAULT_REPORT_RESULTS_THRESHOLD = 25000;
export const CONTAINER_SCANNING_RESULTS_THRESHOLD = 7000;
export const DEFAULT_LOG_LEVEL = 'warn';
export const DEFAULT_TIMEOUT = 300000; // 5 minutes

const set = (
  storage: SettingsStorage,
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

class Settings {
  public reloadInterval: number;
  public reloadIntervalActive: number;
  public reloadIntervalInactive: number;
  public reportResultsThreshold: number;
  public timeout: number;

  public readonly storage: SettingsStorage;
  public readonly apiProtocol!: string;
  public readonly apiServer!: string;
  public readonly disableLoginForm!: boolean;
  public readonly enableAssetManagement!: boolean;
  public readonly enableCommunityFeedNotification: boolean;
  public readonly enableEPSS!: boolean;
  public readonly enableGreenboneSensor!: boolean;
  public readonly enableKrb5!: boolean;
  public readonly guestPassword?: string;
  public readonly guestUsername?: string;
  public readonly manualLanguageMapping!: LanguageMapping;
  public readonly manualUrl!: string;
  public readonly protocolDocUrl!: string;
  public readonly severityRating!: SeverityRating;
  public readonly vendorLabel?: string;
  public readonly vendorTitle!: string;
  public readonly vendorVersion?: string;

  constructor(
    storage: SettingsStorage = globalThis.localStorage,
    options: SettingsOptions = {},
  ) {
    const {
      enableEPSS = true,
      enableKrb5 = false,
      enableGreenboneSensor = false,
      disableLoginForm = false,
      enableStoreDebugLog,
      enableAssetManagement = false,
      enableCommunityFeedNotification = true,
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
      vendorTitle,
    } = options;
    let {
      apiProtocol = protocol,
      apiServer = server,
      logLevel = loglevel,
      severityRating = DEFAULT_SEVERITY_RATING,
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
      apiProtocol = globalThis.location.protocol;
    }
    if (!isDefined(apiServer)) {
      apiServer = globalThis.location.host;
    }
    if (
      severityRating !== SEVERITY_RATING_CVSS_3 &&
      severityRating !== SEVERITY_RATING_CVSS_2
    ) {
      severityRating = DEFAULT_SEVERITY_RATING;
    }

    this.enableCommunityFeedNotification = enableCommunityFeedNotification;
    this.logLevel = logLevel;
    this.reloadInterval = reloadInterval;
    this.reloadIntervalActive = reloadIntervalActive;
    this.reloadIntervalInactive = reloadIntervalInactive;
    this.reportResultsThreshold = reportResultsThreshold;
    this.timeout = timeout;

    setAndFreeze(this, 'apiProtocol', apiProtocol);
    setAndFreeze(this, 'apiServer', apiServer);
    setAndFreeze(this, 'disableLoginForm', disableLoginForm);
    setAndFreeze(this, 'enableAssetManagement', enableAssetManagement);
    setAndFreeze(this, 'enableEPSS', enableEPSS);
    setAndFreeze(this, 'enableGreenboneSensor', enableGreenboneSensor);
    setAndFreeze(this, 'enableKrb5', enableKrb5);
    setAndFreeze(this, 'guestPassword', guestPassword);
    setAndFreeze(this, 'guestUsername', guestUsername);
    setAndFreeze(this, 'manualLanguageMapping', manualLanguageMapping);
    setAndFreeze(this, 'manualUrl', manualUrl);
    setAndFreeze(this, 'protocolDocUrl', protocolDocUrl);
    setAndFreeze(this, 'severityRating', severityRating);
    setAndFreeze(this, 'vendorLabel', vendorLabel);
    setAndFreeze(this, 'vendorTitle', vendorTitle);
    setAndFreeze(this, 'vendorVersion', vendorVersion);
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

export default Settings;
