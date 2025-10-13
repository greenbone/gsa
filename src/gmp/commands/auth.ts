/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {convertBoolean} from 'gmp/commands/convert';
import HttpCommand from 'gmp/commands/http';

interface SaveLdapArguments {
  authdn: string;
  certificate?: File;
  ldapEnabled: boolean;
  ldapHost: string;
  ldapsOnly?: boolean;
}

interface SaveRadiusArguments {
  radiusEnabled: boolean;
  radiusHost: string;
  radiusKey: string;
}

class AuthenticationCommand extends HttpCommand {
  saveLdap({
    authdn,
    certificate,
    ldapEnabled,
    ldapHost,
    ldapsOnly,
  }: SaveLdapArguments) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate,
      enable: convertBoolean(ldapEnabled),
      ldaphost: ldapHost,
      ldaps_only: convertBoolean(ldapsOnly),
    });
  }

  saveRadius({radiusEnabled, radiusHost, radiusKey}: SaveRadiusArguments) {
    return this.httpPost({
      cmd: 'save_auth',
      group: 'method:radius_connect',
      enable: convertBoolean(radiusEnabled),
      radiushost: radiusHost,
      radiuskey: radiusKey,
    });
  }
}

export default AuthenticationCommand;
