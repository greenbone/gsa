/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from '../command';
import {convertBoolean} from './convert';
import HttpCommand from './http';

export class AuthenticationCommand extends HttpCommand {
  saveLdap({authdn, certificate, enable, ldaphost, ldapsOnly}) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate,
      enable: convertBoolean(enable),
      ldaphost,
      ldaps_only: convertBoolean(ldapsOnly),
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
