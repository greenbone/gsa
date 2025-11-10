/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

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
    return this.httpPostWithTransform({
      cmd: 'save_auth',
      group: 'method:ldap_connect',
      authdn,
      certificate,
      enable: parseYesNo(ldapEnabled),
      ldaphost: ldapHost,
      ldaps_only: isDefined(ldapsOnly) ? parseYesNo(ldapsOnly) : undefined,
    });
  }

  saveRadius({radiusEnabled, radiusHost, radiusKey}: SaveRadiusArguments) {
    return this.httpPostWithTransform({
      cmd: 'save_auth',
      group: 'method:radius_connect',
      enable: parseYesNo(radiusEnabled),
      radiushost: radiusHost,
      radiuskey: radiusKey,
    });
  }
}

export default AuthenticationCommand;
