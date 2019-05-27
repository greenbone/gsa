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
import _ from '../locale';

import HttpCommand from './http';

import Login from '../models/login';

class LoginCommand extends HttpCommand {
  constructor(http) {
    super(http, {
      cmd: 'login',
    });
  }

  login(username, password) {
    return this.httpPost({
      login: username,
      password,
    }).then(
      response => new Login(response),
      rej => {
        if (rej.isError && rej.isError()) {
          switch (rej.status) {
            case 401:
              rej.setMessage(_('Bad login information'));
              break;
            case 404:
              // likely the config is wrong for the server address
              rej.setMessage(_('Could not connect to server'));
              break;
            case 500:
              rej.setMessage(_('GMP error during authentication'));
              break;
            case 503:
              rej.setMessage(_('GMP Service is down'));
              break;
            default:
              break;
          }
        }
        throw rej;
      },
    );
  }
}

export default LoginCommand;

// vim: set ts=2 sw=2 tw=80:
