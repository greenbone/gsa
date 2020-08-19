/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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
import {isEmpty} from './utils/string';

import logger from './log.js';

import './commands/alerts.js';
import './commands/audits.js';
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
import './commands/login.js';
import './commands/notes.js';
import './commands/nvt.js';
import './commands/nvtfamilies';
import './commands/os.js';
import './commands/ovaldefs.js';
import './commands/overrides.js';
import './commands/performance.js';
import './commands/permissions.js';
import './commands/policies.js';
import './commands/portlists.js';
import './commands/reportformats.js';
import './commands/reports.js';
import './commands/results.js';
import './commands/roles.js';
import './commands/scanconfigs.js';
import './commands/scanners.js';
import './commands/schedules.js';
import './commands/tags.js';
import './commands/targets.js';
import './commands/tasks.js';
import './commands/tickets.js';
import './commands/tlscertificates.js';
import './commands/trashcan.js';
import './commands/users.js';
import './commands/vulns.js';
import './commands/wizard.js';

import GmpHttp from './http/gmp.js';
import {buildServerUrl, buildUrlParams} from './http/utils.js';
import DefaultTransform from './http/transform/default';

import {getCommands} from './command.js';

import {setLocale} from './locale/lang';

const log = logger.getLogger('gmp');

class Gmp {
  constructor(settings = {}, http) {
    this.settings = settings;

    logger.init(this.settings);

    log.debug('Using gmp settings', settings);

    this.log = logger;

    this.http = isDefined(http) ? http : new GmpHttp(this.settings);

    this._logoutListeners = [];

    this._initCommands();
  }

  _initCommands() {
    for (const [name, cmd] of Object.entries(getCommands())) {
      const instance = new cmd(this.http);

      Object.defineProperty(this, name, {
        get: function () {
          return instance;
        },
      });
    }
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
      this.settings.apiServer,
      path,
      this.settings.apiProtocol,
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

  addHttpErrorHandler(handler) {
    return this.http.addErrorHandler(handler);
  }
}

export default Gmp;

// vim: set ts=2 sw=2 tw=80:
