/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import registerCommand from '../command';

import HttpCommand from './http';

import {convertBoolean} from './convert';

export class AuthenticationCommand extends HttpCommand {
  saveLdap({authdn, certificate, enable, ldaphost}) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate,
      enable: convertBoolean(enable),
      ldaphost,
    });
  }

  saveRadius({enable, radiushost, radiuskey}) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:radius_connect',
      enable: convertBoolean(enable),
      radiushost,
      radiuskey,
    });
  }
}

registerCommand('auth', AuthenticationCommand);
