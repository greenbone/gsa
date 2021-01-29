/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import Credential from 'gmp/models/credential';

import DefaultTransform from 'gmp/http/transform/default';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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
      certificate,
      credential_type,
      privacy_algorithm = 'aes',
      private_key,
      public_key,
    } = args;
    log.debug('Creating new credential', args);
    return this.action({
      cmd: 'create_credential',
      name,
      comment,
      credential_type,
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
      public_key,
      certificate,
    });
  }

  save(args) {
    const {
      allow_insecure = 0,
      auth_algorithm,
      certificate,
      change_community = 0,
      change_passphrase = 0,
      change_password = 0,
      change_privacy_password = 0,
      comment = '',
      community,
      credential_login,
      credential_type,
      id,
      name,
      passphrase,
      password,
      privacy_algorithm,
      privacy_password,
      private_key,
      public_key,
    } = args;
    log.debug('Saving credential', args);
    return this.action({
      cmd: 'save_credential',
      allow_insecure,
      auth_algorithm,
      certificate,
      change_community,
      change_passphrase,
      change_password,
      change_privacy_password,
      comment,
      community,
      credential_login,
      credential_type,
      id,
      password,
      name,
      passphrase,
      privacy_algorithm,
      privacy_password,
      private_key,
      public_key,
    });
  }

  download({id}, format = 'pem') {
    return this.httpGet(
      {
        cmd: 'download_credential',
        package_format: format,
        credential_id: id,
      },
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
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

registerCommand('credential', CredentialCommand);
registerCommand('credentials', CredentialsCommand);

// vim: set ts=2 sw=2 tw=80:
