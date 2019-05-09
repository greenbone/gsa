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
import {isDefined} from './utils/identity';

export const DEFAULT_RELOAD_INTERVAL = 15 * 1000; // fifteen seconds
export const DEFAULT_MANUAL_URL = 'http://docs.greenbone.net/GSM-Manual/gos-4/';
export const DEFAULT_PROTOCOLDOC_URL =
  'https://docs.greenbone.net/API/GMP/gmp-8.0.html';
export const DEFAULT_LOG_LEVEL = 'warn';

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

class GmpSettings {
  constructor(storage = global.localStorage, options = {}) {
    const {
      disableLoginForm = false,
      loglevel = storage.loglevel,
      manualUrl = DEFAULT_MANUAL_URL,
      manualLanguageMapping,
      protocol = global.location.protocol,
      protocoldocurl = DEFAULT_PROTOCOLDOC_URL,
      reloadinterval = DEFAULT_RELOAD_INTERVAL,
      server = global.location.host,
      timeout,
      guestUsername,
      guestPassword,
      vendorVersion,
      vendorLabel,
    } = {...options};
    this.storage = storage;

    this.loglevel = isDefined(loglevel) ? loglevel : DEFAULT_LOG_LEVEL;
    this.reloadinterval = reloadinterval;
    this.timeout = timeout;

    setAndFreeze(this, 'manualUrl', manualUrl);
    setAndFreeze(this, 'manualLanguageMapping', manualLanguageMapping);
    setAndFreeze(this, 'protocoldocurl', protocoldocurl);
    setAndFreeze(this, 'server', server);
    setAndFreeze(this, 'protocol', protocol);
    setAndFreeze(this, 'guestUsername', guestUsername);
    setAndFreeze(this, 'guestPassword', guestPassword);
    setAndFreeze(this, 'disableLoginForm', disableLoginForm);
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

  get loglevel() {
    return this.storage.loglevel;
  }

  set loglevel(value) {
    set(this.storage, 'loglevel', value);
  }
}

export default GmpSettings;

// vim: set ts=2 sw=2 tw=80:
