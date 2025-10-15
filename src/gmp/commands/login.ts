/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import type GmpHttp from 'gmp/http/gmp';
import Rejection from 'gmp/http/rejection';
import _ from 'gmp/locale';
import Login from 'gmp/models/login';

class LoginCommand extends HttpCommand {
  constructor(http: GmpHttp) {
    super(http, {
      cmd: 'login',
    });
  }

  async login(username: string, password: string) {
    try {
      const response = await this.httpPost({
        login: username,
        password,
      });
      return new Login(response);
    } catch (rej) {
      if (rej instanceof Rejection && rej.isError && rej.isError()) {
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
            rej.setMessage(
              _(
                'The Greenbone Vulnerability Manager service is not ' +
                  'responding. This could be due to system maintenance. ' +
                  'Please try again later, check the system status, or ' +
                  'contact your system administrator.',
              ),
            );
            break;
          default:
            break;
        }
      }
      throw rej;
    }
  }
}

export default LoginCommand;
