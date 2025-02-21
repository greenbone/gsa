/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import {convertBoolean} from 'gmp/commands/convert';
import HttpCommand from 'gmp/commands/http';

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
