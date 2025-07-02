/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import DefaultTransform from 'gmp/http/transform/default';
import logger from 'gmp/log';
import Credential from 'gmp/models/credential';

const log = logger.getLogger('gmp.commands.credentials');

export class CredentialCommand extends EntityCommand {
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
      realm,
      kdcs = [],
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
      realm,
      'kdcs:': kdcs.length > 0 ? kdcs : undefined,
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
      kdcs = [],
      realm,
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
      'kdcs:': kdcs.length > 0 ? kdcs : undefined,
      realm,
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
