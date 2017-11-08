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

import _ from '../locale.js';

import {HttpCommand} from '../command.js';

import Login from '../models/login.js';

export class LoginCommand extends HttpCommand {

  constructor(http) {
    super(http, {
      cmd: 'login',
      text: '/omp?xml=1',
      no_redirect: '1', // TODO fix in gsad
    });
  }

  login(username, password) {
    return this.httpPost({
      login: username,
      password
    }).then(responsedata => new Login(responsedata.data), rej => {
      if (rej.isError && rej.isError() && rej.xhr) {
        if (rej.xhr.status === 401) {
          rej.setMessage(_('Bad login information'));
        }
        else if (rej.xhr.status === 404) {
          // likely the config is wrong for the server address
          rej.setMessage(_('Could not connect to server'));
        }
      }
      throw rej;
    });
  }
}

export default LoginCommand;

// vim: set ts=2 sw=2 tw=80:
