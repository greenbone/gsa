/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityActionResponse} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import CredentialStore, {
  type CredentialStoreElement,
} from 'gmp/models/credential-store';
import {type Element} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';

export interface CredentialStoreModifyParams {
  id: string; // Maps to credential_store_id
  active?: boolean;
  appId?: string;
  host?: string;
  path?: string;
  port?: string;
  comment?: string;
  // Preferences - these will be passed as preferences:key format
  clientCertificate?: File;
  clientKey?: File;
  pkcs12File?: File;
  passphrase?: string;
  serverCaCertificate?: File;
}

const log = logger.getLogger('gmp.commands.credentialStore');

class CredentialStoreCommand extends EntityCommand<
  CredentialStore,
  CredentialStoreElement
> {
  constructor(http: Http) {
    super(http, 'credential_store', CredentialStore);
  }

  getElementFromRoot(root: Element): CredentialStoreElement {
    // @ts-expect-error
    return root.get_credential_store.get_credential_stores_response
      .credential_store;
  }

  async modify({
    id,
    active,
    appId,
    host,
    path,
    port,
    comment,
    clientCertificate,
    clientKey,
    pkcs12File,
    passphrase,
    serverCaCertificate,
  }: CredentialStoreModifyParams): Promise<EntityActionResponse> {
    log.debug('Modifying credential store', {
      id,
      active,
      appId,
      host,
      path,
      port,
      comment,
      clientCertificate: Boolean(clientCertificate),
      clientKey: Boolean(clientKey),
      pkcs12File: Boolean(pkcs12File),
      passphrase: Boolean(passphrase),
      serverCaCertificate: Boolean(serverCaCertificate),
    });

    return this.entityAction({
      cmd: 'modify_credential_store',
      credential_store_id: id,
      active: parseYesNo(active),
      host,
      path,
      port,
      comment,
      'preferences:app_id': appId,
      'preferences:client_certificate': clientCertificate,
      'preferences:client_key': clientKey,
      'preferences:pkcs12_file': pkcs12File,
      'preferences:passphrase': passphrase,
      'preferences:server_ca_certificate': serverCaCertificate,
    });
  }

  async verify({id}: {id: string}): Promise<EntityActionResponse> {
    log.debug('Verifying credential store', {id});

    return this.entityAction({
      cmd: 'verify_credential_store',
      credential_store_id: id,
    });
  }
}

export default CredentialStoreCommand;
