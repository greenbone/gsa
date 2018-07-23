/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import registerCommand from '../command';

import HttpCommand from './http';

class AuthenticationCommand extends HttpCommand {

  saveLdap({
    authdn,
    certificate_info,
    enable,
    group,
    ldaphost,
  }) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate_info,
      enable,
      ldaphost,
    });
  }

  saveRadius({
    enable,
    group,
    radiushost,
    radiuskey,
  }) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:radius_connect',
      enable,
      radiushost,
      radiuskey,
    });
  }
}

registerCommand('auth', AuthenticationCommand);
