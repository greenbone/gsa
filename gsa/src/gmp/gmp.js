/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

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
import './commands/tickets.js';
import './commands/trashcan.js';
import './commands/users.js';
import './commands/vulns.js';
import './commands/wizard.js';

import GmpHttp from './http/gmp.js';
import {buildServerUrl, buildUrlParams} from './http/utils.js';
import DefaultTransform from './http/transform/default';

import {getCommands} from './command.js';
import LoginCommand from './commands/login.js';

import {setLocale} from './locale/lang';
import {BROWSER_LANGUAGE} from './locale/languages';

const log = logger.getLogger('gmp');

class Gmp {
  constructor(settings = {}, http) {
    this.settings = settings;

    logger.init(this.settings);

    log.debug('Using gmp settings', settings);

    this.log = logger;

    this.http = isDefined(http) ? http : new GmpHttp(this.settings);

    this._login = new LoginCommand(this.http);

    this._logoutListeners = [];

    this._initCommands();
  }

  _initCommands() {
    for (const [name, cmd] of Object.entries(getCommands())) {
      const instance = new cmd(this.http);

      Object.defineProperty(this, name, {
        get: function() {
          return instance;
        },
      });
    }
  }

  login(username, password) {
    return this._login.login(username, password).then(login => {
      const {token, timezone, locale, sessionTimeout} = login;

      this.settings.username = username;
      this.settings.timezone = timezone;
      this.settings.token = token;
      this.settings.locale = locale;

      return {
        locale: locale === BROWSER_LANGUAGE ? undefined : locale,
        username,
        token,
        timezone,
        sessionTimeout,
      };
    });
  }

  doLogout() {
    if (this.isLoggedIn()) {
      const url = this.buildUrl('logout');
      const args = {token: this.settings.token};

      const promise = this.http
        .request('get', {
          url,
          args,
          transform: DefaultTransform,
        })
        .catch(err => {
          log.error('Error on logout', err);
        })
        .then(() => {
          this.logout();
        });

      return promise;
    }

    return Promise.resolve();
  }

  logout() {
    this.clearToken();

    for (const listener of this._logoutListeners) {
      listener();
    }
  }

  isLoggedIn() {
    return !isEmpty(this.settings.token);
  }

  subscribeToLogout(listener) {
    this._logoutListeners.push(listener);

    return () =>
      (this._logoutListeners = this._logoutListeners.filter(
        l => l !== listener,
      ));
  }

  buildUrl(path, params, anchor) {
    let url = buildServerUrl(
      this.settings.server,
      path,
      this.settings.protocol,
    );

    if (isDefined(params)) {
      url += '?' + buildUrlParams(params);
    }

    if (isDefined(anchor)) {
      url += '#' + anchor;
    }
    return url;
  }

  clearToken() {
    this.settings.token = undefined;
  }

  setLocale(lang) {
    this.settings.locale = lang;
    setLocale(lang);
    return this;
  }

  setTimezone(timezone) {
    this.settings.timezone = timezone;
    return this;
  }

  get reloadInterval() {
    return this.settings.reloadinterval;
  }

  addHttpErrorHandler(handler) {
    return this.http.addErrorHandler(handler);
  }
}

export default Gmp;

// vim: set ts=2 sw=2 tw=80:
