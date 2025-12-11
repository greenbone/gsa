/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import Credential, {
  type CredentialType,
  type CredentialElement,
  type SNMPAuthAlgorithmType,
  type SNMPPrivacyAlgorithmType,
} from 'gmp/models/credential';
import {type Element} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';

export type CredentialDownloadFormat = 'pem' | 'key' | 'rpm' | 'deb' | 'exe';

interface CredentialCommandCreateArgs {
  authAlgorithm?: SNMPAuthAlgorithmType;
  autogenerate?: boolean;
  certificate?: File;
  comment?: string;
  community?: string;
  credentialLogin?: string;
  credentialType?: CredentialType;
  hostIdentifier?: string;
  kdcs?: string[];
  name: string;
  passphrase?: string;
  password?: string;
  privacyAlgorithm?: SNMPPrivacyAlgorithmType;
  privacyHostIdentifier?: string;
  privacyPassword?: string;
  privateKey?: File;
  publicKey?: File;
  realm?: string;
  vaultId?: string;
}

interface CredentialCommandSaveArgs
  extends Omit<CredentialCommandCreateArgs, 'autogenerate'> {
  id: string;
}

class CredentialCommand extends EntityCommand<
  Credential,
  CredentialElement,
  Element
> {
  constructor(http: Http) {
    super(http, 'credential', Credential);
  }

  create({
    name,
    comment,
    autogenerate,
    community,
    credentialLogin,
    password,
    passphrase,
    privacyPassword,
    authAlgorithm,
    certificate,
    credentialType,
    privacyAlgorithm,
    privateKey,
    publicKey,
    realm,
    kdcs,
    vaultId,
    hostIdentifier,
    privacyHostIdentifier,
  }: CredentialCommandCreateArgs) {
    return this.action({
      cmd: 'create_credential',
      auth_algorithm: authAlgorithm,
      autogenerate: parseYesNo(autogenerate),
      certificate,
      comment,
      community,
      credential_login: credentialLogin,
      credential_type: credentialType,
      host_identifier: hostIdentifier,
      lsc_password: password,
      name,
      passphrase,
      privacy_algorithm: privacyAlgorithm,
      privacy_password: privacyPassword,
      private_key: privateKey,
      public_key: publicKey,
      vault_id: vaultId,
      realm,
      'kdcs:': kdcs,
      privacy_host_identifier: privacyHostIdentifier,
    });
  }

  save({
    authAlgorithm,
    certificate,
    comment,
    community,
    credentialLogin,
    credentialType,
    id,
    name,
    passphrase,
    password,
    privacyAlgorithm,
    privacyPassword,
    privateKey,
    publicKey,
    kdcs,
    realm,
    vaultId,
    hostIdentifier,
    privacyHostIdentifier,
  }: CredentialCommandSaveArgs) {
    return this.action({
      cmd: 'save_credential',
      'kdcs:': kdcs,
      auth_algorithm: authAlgorithm,
      certificate,
      comment,
      community,
      credential_login: credentialLogin,
      credential_type: credentialType,
      host_identifier: hostIdentifier,
      id,
      name,
      passphrase,
      password,
      privacy_algorithm: privacyAlgorithm,
      privacy_host_identifier: privacyHostIdentifier,
      privacy_password: privacyPassword,
      private_key: privateKey,
      public_key: publicKey,
      realm,
      vault_id: vaultId,
    });
  }

  async download({id}, format: CredentialDownloadFormat = 'pem') {
    return this.httpRequestWithRejectionTransform<ArrayBuffer>('get', {
      args: {
        cmd: 'download_credential',
        package_format: format,
        credential_id: id,
      },
      responseType: 'arraybuffer',
    });
  }

  getElementFromRoot(root: Element): CredentialElement {
    // @ts-expect-error
    return root.get_credential.get_credentials_response.credential;
  }
}

export default CredentialCommand;
