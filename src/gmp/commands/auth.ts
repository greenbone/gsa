/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {convertBoolean} from 'gmp/commands/convert';
import HttpCommand from 'gmp/commands/http';

interface SaveLdapArguments {
  authdn: string;
  certificate: File;
  enable: boolean;
  ldapHost: string;
  ldapsOnly?: boolean;
}

interface SaveRadiusArguments {
  enable: boolean;
  radiusHost: string;
  radiusKey: string;
}

class AuthenticationCommand extends HttpCommand {
  saveLdap({
    authdn,
    certificate,
    enable,
    ldapHost,
    ldapsOnly,
  }: SaveLdapArguments) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate,
      enable: convertBoolean(enable),
      ldaphost: ldapHost,
      ldaps_only: convertBoolean(ldapsOnly),
    });
  }

  saveRadius({enable, radiusHost, radiusKey}: SaveRadiusArguments) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:radius_connect',
      enable: convertBoolean(enable),
      radiushost: radiusHost,
      radiuskey: radiusKey,
    });
  }
}

export default AuthenticationCommand;
