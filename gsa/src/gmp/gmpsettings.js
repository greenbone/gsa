/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

const set = (storage, name, value) => {
  if (isDefined(value)) {
    storage.setItem(name, value);
  }
  else {
    storage.removeItem(name);
  }
};

class GmpSettings {
  constructor(storage = global.localStorage, options = {}) {
    const {
      autorefresh,
      locale,
      manualurl,
      protocol = global.location.host,
      protocoldocurl,
      server = global.location.host,
      token,
      timeout,
      timezone,
      username,
    } = {...storage, ...options};
    this.storage = storage;

    this.autorefresh = autorefresh;
    this.locale = locale;
    this.manualurl = manualurl;
    this.protocol = protocol;
    this.protocoldocurl = protocoldocurl;
    this.server = server;
    this.token = token;
    this.timezone = timezone;
    this.timeout = timeout;
    this.username = username;
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
}

export default GmpSettings;

// vim: set ts=2 sw=2 tw=80:
