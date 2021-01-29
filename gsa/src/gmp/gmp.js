/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import logger from 'gmp/log';

import 'gmp/commands/alerts';
import 'gmp/commands/audits';
import 'gmp/commands/auth';
import 'gmp/commands/certbund';
import 'gmp/commands/credentials';
import 'gmp/commands/cpes';
import 'gmp/commands/cves';
import 'gmp/commands/cvsscalculator';
import 'gmp/commands/dashboards';
import 'gmp/commands/dfncert';
import 'gmp/commands/feedstatus';
import 'gmp/commands/filters';
import 'gmp/commands/groups';
import 'gmp/commands/hosts';
import 'gmp/commands/login';
import 'gmp/commands/notes';
import 'gmp/commands/nvt';
import 'gmp/commands/nvtfamilies';
import 'gmp/commands/os';
import 'gmp/commands/ovaldefs';
import 'gmp/commands/overrides';
import 'gmp/commands/performance';
import 'gmp/commands/permissions';
import 'gmp/commands/policies';
import 'gmp/commands/portlists';
import 'gmp/commands/reportformats';
import 'gmp/commands/reports';
import 'gmp/commands/results';
import 'gmp/commands/roles';
import 'gmp/commands/scanconfigs';
import 'gmp/commands/scanners';
import 'gmp/commands/schedules';
import 'gmp/commands/tags';
import 'gmp/commands/targets';
import 'gmp/commands/tasks';
import 'gmp/commands/tickets';
import 'gmp/commands/tlscertificates';
import 'gmp/commands/trashcan';
import 'gmp/commands/users';
import 'gmp/commands/vulns';
import 'gmp/commands/wizard';

import GmpHttp from 'gmp/http/gmp';
import {buildServerUrl, buildUrlParams} from 'gmp/http/utils';
import DefaultTransform from 'gmp/http/transform/default';

import {getCommands} from 'gmp/command';

import {setLocale} from 'gmp/locale/lang';

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
