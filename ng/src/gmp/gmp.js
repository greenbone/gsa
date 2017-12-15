/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_defined, is_empty} from './utils.js';

import logger from './log.js';

import './commands/agents.js';
import './commands/alerts.js';
import './commands/auth.js';
import './commands/certbund.js';
import './commands/credentials.js';
import './commands/cpes.js';
import './commands/cves.js';
import './commands/cvsscalculator.js';
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

import {GmpHttp, build_server_url, build_url_params} from './http.js';
import {get_commands} from './command.js';
import LoginCommand from './commands/login.js';

const log = logger.getLogger('gmp');

export class Gmp {

  constructor(options = {}) {
    const {
      autorefresh,
      protocol,
      server,
      storage = localStorage,
      caches,
      manualurl,
      ...httpoptions
    } = options;

    this._commands = {};

    this.caches = caches;
    this.storage = storage;

    this.server = is_defined(server) ? server : window.location.host;
    this.protocol = is_defined(protocol) ? protocol : window.location.protocol;

    this.http = new GmpHttp(this.server, this.protocol, httpoptions);

    this._login = new LoginCommand(this.http);

    this._autorefresh = autorefresh;

    if (this.storage.token) {
      this.token = this.storage.token;
    }

    this.globals = {manualurl};

    const commands = get_commands();
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

      if (is_defined(this.caches)) {
        this.caches.clearAll();
      }

      return this.token;
    });
  }

  logout() {
    const uri = this.buildUrl('logout');
    const args = {xml: 1};
    return this.http.request('get', {uri, args})
      .then(xhr => {
        this.token = undefined;
        return xhr;
      })
      .catch(err => {
        this.token = undefined;
        log.error('Error on logout', err);
      });
  }

  isLoggedIn() {
    return !is_empty(this.token);
  }

  buildUrl(path, params, anchor) {
    let url = build_server_url(this.server, path, this.protocol);

    if (is_defined(params)) {
      url += '?' + build_url_params(params);
    }

    if (is_defined(anchor)) {
      url += '#' + anchor;
    }
    return url;
  }

  get token() {
    return this.http.token;
  }

  set token(token) {
    if (is_defined(token)) {
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
    if (is_defined(this.storage.globals)) {
      return JSON.parse(this.storage.globals);
    }
    return {};
  }

  set globals(values) {
    if (is_defined(values)) {
      const {globals} = this;
      this.storage.globals = JSON.stringify({...globals, ...values});
    }
    else {
      this.storage.removeItem('globals');
    }
  }

  get autorefresh() {
    return is_defined(this._autorefresh) ?
      this._autorefresh :
      this.globals.autorefresh;
  }

  addHttpInterceptor(interceptor) {
    this.http.addInterceptor(interceptor);
  }
}

export default Gmp;

// vim: set ts=2 sw=2 tw=80:
