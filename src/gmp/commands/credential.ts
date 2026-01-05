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
import {isDefined} from 'gmp/utils/identity';

export type CredentialDownloadFormat = 'pem' | 'key' | 'rpm' | 'deb' | 'exe';

interface CredentialCommandBaseArgs {
  authAlgorithm?: SNMPAuthAlgorithmType;
  autogenerate?: boolean;
  certificate?: File | null;
  comment?: string;
  community?: string;
  credentialLogin?: string;
  credentialType?: CredentialType;
  name: string;
  passphrase?: string;
  password?: string;
  privacyAlgorithm?: SNMPPrivacyAlgorithmType;
  privacyPassword?: string;
  privateKey?: File | null;
  publicKey?: File | null;
}

interface CredentialCommandKrb5Fields {
  kdcs?: string[];
  realm?: string;
}

interface CredentialCommandCredentialStoreFields {
  hostIdentifier?: string;
  vaultId?: string;
}

interface CredentialCommandSnmpFields {
  privacyHostIdentifier?: string;
}

// Create operation interfaces
type CredentialCommandCreateArgs = CredentialCommandBaseArgs;

interface CredentialCommandKrb5Args
  extends CredentialCommandBaseArgs,
    CredentialCommandKrb5Fields {}

interface CredentialCommandCredentialStoreArgs
  extends CredentialCommandBaseArgs,
    CredentialCommandCredentialStoreFields {}

interface CredentialCommandCredentialStoreKrb5Args
  extends CredentialCommandBaseArgs,
    CredentialCommandCredentialStoreFields,
    CredentialCommandKrb5Fields {}

interface CredentialCommandCredentialStoreSnmpArgs
  extends CredentialCommandBaseArgs,
    CredentialCommandCredentialStoreFields,
    CredentialCommandSnmpFields {}

// Save operation interfaces (using utility types)
type CredentialCommandSaveArgs = Omit<
  CredentialCommandBaseArgs,
  'autogenerate'
> & {id: string};

type CredentialCommandSaveKrb5Args = CredentialCommandSaveArgs &
  CredentialCommandKrb5Fields;

type CredentialCommandSaveCredentialStoreArgs = CredentialCommandSaveArgs &
  CredentialCommandCredentialStoreFields;

type CredentialCommandSaveCredentialStoreKrb5Args = CredentialCommandSaveArgs &
  CredentialCommandCredentialStoreFields &
  CredentialCommandKrb5Fields;

type CredentialCommandSaveCredentialStoreSnmpArgs = CredentialCommandSaveArgs &
  CredentialCommandCredentialStoreFields &
  CredentialCommandSnmpFields;

const saveFile = (file: File | undefined | null): File | undefined | string => {
  if (file === null) {
    // remove file from backend
    return '';
  }
  if (!isDefined(file) || file.size === 0) {
    // keep existing file on backend
    return undefined;
  }
  return file;
};

class CredentialCommand extends EntityCommand<
  Credential,
  CredentialElement,
  Element
> {
  constructor(http: Http) {
    super(http, 'credential', Credential);
  }

  private createBase({
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
  }: CredentialCommandBaseArgs) {
    return {
      cmd: 'create_credential',
      auth_algorithm: authAlgorithm,
      autogenerate: parseYesNo(autogenerate),
      certificate,
      comment,
      community,
      credential_login: credentialLogin,
      credential_type: credentialType,
      lsc_password: password,
      name,
      passphrase,
      privacy_algorithm: privacyAlgorithm,
      privacy_password: privacyPassword,
      private_key: privateKey,
      public_key: publicKey,
    };
  }

  create(args: CredentialCommandCreateArgs) {
    const baseData = this.createBase(args);
    return this.action(baseData);
  }

  createKrb5(args: CredentialCommandKrb5Args) {
    const baseData = this.createBase(args);

    return this.action({
      ...baseData,
      realm: args.realm,
      'kdcs:': args.kdcs?.length ? args.kdcs : '',
    });
  }

  private createCredentialStoreBase(
    args: CredentialCommandCredentialStoreArgs,
  ) {
    const baseData = this.createBase(args);

    return {
      ...baseData,
      vault_id: args.vaultId,
      host_identifier: args.hostIdentifier,
    };
  }

  createCredentialStore(args: CredentialCommandCredentialStoreArgs) {
    const baseData = this.createCredentialStoreBase(args);
    return this.action(baseData);
  }

  createCredentialStoreKrb5(args: CredentialCommandCredentialStoreKrb5Args) {
    const baseData = this.createCredentialStoreBase(args);

    return this.action({
      ...baseData,
      realm: args.realm,
      'kdcs:': args.kdcs?.length ? args.kdcs : '',
    });
  }

  createCredentialStoreSnmp(args: CredentialCommandCredentialStoreSnmpArgs) {
    const baseData = this.createCredentialStoreBase(args);

    return this.action({
      ...baseData,
      privacy_host_identifier: args.privacyHostIdentifier,
    });
  }

  private saveBase({
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
  }: CredentialCommandSaveArgs) {
    return {
      cmd: 'save_credential',
      auth_algorithm: authAlgorithm,
      certificate: saveFile(certificate),
      comment,
      community,
      credential_login: credentialLogin,
      credential_type: credentialType,
      credential_id: id,
      name,
      passphrase,
      password,
      privacy_algorithm: privacyAlgorithm,
      privacy_password: privacyPassword,
      private_key: saveFile(privateKey),
      public_key: saveFile(publicKey),
    };
  }

  save(args: CredentialCommandSaveArgs) {
    const baseData = this.saveBase(args);
    return this.action(baseData);
  }

  saveKrb5(args: CredentialCommandSaveKrb5Args) {
    const baseData = this.saveBase(args);

    return this.action({
      ...baseData,
      realm: args.realm,
      'kdcs:': args.kdcs?.length ? args.kdcs : '',
    });
  }

  private saveCredentialStoreBase(
    args: CredentialCommandSaveCredentialStoreArgs,
  ) {
    const baseData = this.saveBase(args);

    return {
      ...baseData,
      vault_id: args.vaultId,
      host_identifier: args.hostIdentifier,
    };
  }

  saveCredentialStore(args: CredentialCommandSaveCredentialStoreArgs) {
    const baseData = this.saveCredentialStoreBase(args);
    return this.action(baseData);
  }

  saveCredentialStoreKrb5(args: CredentialCommandSaveCredentialStoreKrb5Args) {
    const baseData = this.saveCredentialStoreBase(args);

    return this.action({
      ...baseData,
      realm: args.realm,
      'kdcs:': args.kdcs?.length ? args.kdcs : '',
    });
  }

  saveCredentialStoreSnmp(args: CredentialCommandSaveCredentialStoreSnmpArgs) {
    const baseData = this.saveCredentialStoreBase(args);

    return this.action({
      ...baseData,
      privacy_host_identifier: args.privacyHostIdentifier,
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
