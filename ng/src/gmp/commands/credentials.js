/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Credential from '../models/credential.js';

import DefaultTransform from '../http/transform/default.js';

const log = logger.getLogger('gmp.commands.credentials');

class CredentialCommand extends EntityCommand {

  constructor(http) {
    super(http, 'credential', Credential);
  }

  create(args) {
    const {
      name,
      comment = '',
      allow_insecure = 0,
      autogenerate = 0,
      community = '',
      credential_login = '',
      password = '',
      passphrase = '',
      privacy_password = '',
      auth_algorithm = 'sha1',
      certificate, base,
      privacy_algorithm = 'aes',
      private_key,
    } = args;
    log.debug('Creating new credential', args);
    return this.httpPost({
      cmd: 'create_credential',
      next: 'get_credential',
      name,
      comment,
      base,
      allow_insecure,
      autogenerate,
      community,
      credential_login,
      lsc_password: password,
      passphrase,
      privacy_password,
      auth_algorithm,
      privacy_algorithm,
      private_key,
      certificate,
    });
  }

  save(args) {
    const {
      allow_insecure = 0,
      auth_algorithm,
      base,
      certificate,
      change_community = 0,
      change_passphrase = 0,
      change_password = 0,
      change_privacy_password = 0,
      comment = '',
      community,
      credential_login,
      id,
      name,
      passphrase,
      password,
      privacy_algorithm,
      privacy_password,
      private_key,
    } = args;
    log.debug('Saving credential', args);
    return this.httpPost({
      cmd: 'save_credential',
      next: 'get_credential',
      allow_insecure,
      auth_algorithm,
      base,
      certificate,
      change_community,
      change_passphrase,
      change_password,
      change_privacy_password,
      comment,
      community,
      credential_login,
      id,
      password,
      name,
      passphrase,
      privacy_algorithm,
      privacy_password,
      private_key,
    });
  }

  download({id}, format = 'pem') {
    return this.httpGet({
      cmd: 'download_credential',
      package_format: format,
      credential_id: id,
    }, {transform: DefaultTransform});
  }

  getElementFromRoot(root) {
    return root.get_credential.get_credentials_response.credential;
  }
}

class CredentialsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'credential', Credential);
  }

  getEntitiesResponse(root) {
    return root.get_credentials.get_credentials_response;
  }
}

register_command('credential', CredentialCommand);
register_command('credentials', CredentialsCommand);

// vim: set ts=2 sw=2 tw=80:
