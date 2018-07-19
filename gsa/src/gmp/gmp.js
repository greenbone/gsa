/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {isEmpty} from './utils/string';

import logger from './log.js';

import './commands/agents.js';
import './commands/alerts.js';
import './commands/auth.js';
import './commands/certbund.js';
import './commands/credentials.js';
import './commands/cpes.js';
import './commands/cves.js';
import './commands/cvsscalculator.js';
import './commands/dashboards.js';
import './commands/dfncert.js';
import './commands/feedstatus.js';
import './commands/filters.js';
import './commands/groups.js';
import './commands/hosts.js';
import './commands/notes.js';
import './commands/nvt.js';
import './commands/os.js';
import './commands/ovaldefs.js';
import './commands/overrides.js';
import './commands/performance.js';
import './commands/permissions.js';
import './commands/portlists.js';
import './commands/reportformats.js';
import './commands/reports.js';
import './commands/results.js';
import './commands/roles.js';
import './commands/scanconfigs.js';
import './commands/scanners.js';
import './commands/schedules.js';
import './commands/secinfo.js';
import './commands/tags.js';
import './commands/targets.js';
import './commands/tasks.js';
import './commands/trashcan.js';
import './commands/users.js';
import './commands/vulns.js';
import './commands/wizard.js';

import GmpHttp from './http/gmp.js';
import {buildServerUrl, buildUrlParams} from './http/utils.js';
import DefaultTransform from './http/transform/default';

import {getCommands} from './command.js';
import LoginCommand from './commands/login.js';

const log = logger.getLogger('gmp');

class Gmp {

  constructor(options = {}) {
    const {
      autorefresh,
      protocol,
      server,
      storage = localStorage,
      manualurl,
      protocoldocurl,
      ...httpoptions
    } = options;

    log.debug('Using gmp options', options);

    this._commands = {};

    this.storage = storage;

    this.server = isDefined(server) ? server : window.location.host;
    this.protocol = isDefined(protocol) ? protocol : window.location.protocol;

    this.http = new GmpHttp(this.server, this.protocol, httpoptions);

    this._login = new LoginCommand(this.http);

    this._autorefresh = autorefresh;

    this._logoutListeners = [];

    if (this.storage.token) {
      this.token = this.storage.token;
    }

    this.globals = {manualurl, protocoldocurl};

    const commands = getCommands();
    for (const name in commands) { // eslint-disable-line guard-for-in
      const cmd = commands[name];
      const instance = new cmd.clazz(this.http, ...cmd.options);
      this._commands[name] = instance;

      Object.defineProperty(this, name, {
        get: function() {
          return this._commands[name];
        },
      });
    }
  }

  login(username, password) {
    return this._login.login(username, password).then(login => {
      this.token = login.token;

      delete login.token;

      this.username = username;
      this.globals = login;

      return this.token;
    });
  }

  logout() {
    if (this.isLoggedIn()) {
      const url = this.buildUrl('logout');
      const args = {token: this.token};

      const promise = this.http.request('get', {
        url,
        args,
        transform: DefaultTransform,
      }).then(xhr => {
          this.token = undefined;
          log.debug('Logged out successfully');
          return xhr;
        })
        .catch(err => {
          this.token = undefined;
          log.error('Error on logout', err);
        });

      for (const listener of this._logoutListeners) {
        listener();
      }

      return promise;
    }

    return Promise.resolve();
  }

  isLoggedIn() {
    return !isEmpty(this.token);
  }

  subscribeToLogout(listener) {
    this._logoutListeners.push(listener);

    return () => this._logoutListeners = this._logoutListeners.filter(
      l => l !== listener);
  }

  buildUrl(path, params, anchor) {
    let url = buildServerUrl(this.server, path, this.protocol);

    if (isDefined(params)) {
      url += '?' + buildUrlParams(params);
    }

    if (isDefined(anchor)) {
      url += '#' + anchor;
    }
    return url;
  }

  get token() {
    return this.http.token;
  }

  set token(token) {
    if (isDefined(token)) {
      this.storage.token = token;
    }
    else {
      delete this.storage.token;
    }
    this.http.token = token;
  }

  get username() {
    return this.storage.username;
  }

  set username(value) {
    this.storage.username = value;
  }

  get globals() {
    if (isDefined(this.storage.globals)) {
      return JSON.parse(this.storage.globals);
    }
    return {};
  }

  set globals(values) {
    if (isDefined(values)) {
      const {globals} = this;
      this.storage.globals = JSON.stringify({...globals, ...values});
    }
    else {
      this.storage.removeItem('globals');
    }
  }

  get autorefresh() {
    return isDefined(this._autorefresh) ?
      this._autorefresh :
      this.globals.autorefresh;
  }

  addHttpErrorHandler(handler) {
    return this.http.addErrorHandler(handler);
  }
}

export default Gmp;

// vim: set ts=2 sw=2 tw=80:
