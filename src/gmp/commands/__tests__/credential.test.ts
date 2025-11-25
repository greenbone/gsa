/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CredentialCommand from 'gmp/commands/credential';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing';
import {CERTIFICATE_CREDENTIAL_TYPE} from 'gmp/models/credential';

const certificate = new File(['cert'], 'cert.pem');
const privateKey = new File(['private_key'], 'key.pem');
const publicKey = new File(['public_key'], 'key.pub');

describe('CredentialCommand tests', () => {
  test('should create credential', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.create({name: 'test-credential'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        name: 'test-credential',
        comment: undefined,
        autogenerate: 0,
        community: undefined,
        credential_login: undefined,
        lsc_password: undefined,
        passphrase: undefined,
        privacy_password: undefined,
        auth_algorithm: undefined,
        privacy_algorithm: undefined,
        private_key: undefined,
        public_key: undefined,
        certificate: undefined,
        realm: undefined,
        'kdcs:': undefined,
        credential_type: undefined,
      },
    });

    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create credential with all params', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'full-credential',
      comment: 'a full credential',
      authAlgorithm: 'md5',
      autogenerate: true,
      certificate,
      community: 'community',
      credentialLogin: 'login',
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
      hostIdentifier: 'identifier',
      password: 'password',
      passphrase: 'passphrase',
      privacyAlgorithm: 'des',
      privacyPassword: 'privacy_password',
      privateKey,
      publicKey,
      realm: 'kerberos_realm',
      kdcs: ['kerberos_kdc'],
      vaultId: 'vault123',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        name: 'full-credential',
        comment: 'a full credential',
        auth_algorithm: 'md5',
        autogenerate: 1,
        certificate,
        community: 'community',
        credential_login: 'login',
        credential_type: CERTIFICATE_CREDENTIAL_TYPE,
        host_identifier: 'identifier',
        lsc_password: 'password',
        passphrase: 'passphrase',
        privacy_algorithm: 'des',
        privacy_password: 'privacy_password',
        private_key: privateKey,
        public_key: publicKey,
        realm: 'kerberos_realm',
        'kdcs:': ['kerberos_kdc'],
        vault_id: 'vault123',
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should save credential with minimal params', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.save({
      id: '1',
      name: 'updated-credential',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        credential_id: '1',
        name: 'updated-credential',
        comment: undefined,
        auth_algorithm: undefined,
        certificate: undefined,
        community: undefined,
        credential_login: undefined,
        credential_type: undefined,
        passphrase: undefined,
        password: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        realm: undefined,
        'kdcs:': undefined,
        vault_id: undefined,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should save credential with all params', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.save({
      id: '1',
      name: 'updated-credential',
      comment: 'updated comment',
      authAlgorithm: 'md5',
      certificate,
      community: 'community',
      credentialLogin: 'login',
      credentialType: 'cc',
      passphrase: 'passphrase',
      password: 'password',
      privacyAlgorithm: 'des',
      privacyPassword: 'privacy_password',
      privateKey,
      publicKey,
      realm: 'kerberos_realm',
      kdcs: ['kerberos_kdc'],
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        credential_id: '1',
        name: 'updated-credential',
        comment: 'updated comment',
        auth_algorithm: 'md5',
        certificate,
        community: 'community',
        credential_login: 'login',
        credential_type: CERTIFICATE_CREDENTIAL_TYPE,
        passphrase: 'passphrase',
        password: 'password',
        privacy_algorithm: 'des',
        privacy_password: 'privacy_password',
        private_key: privateKey,
        public_key: publicKey,
        realm: 'kerberos_realm',
        'kdcs:': ['kerberos_kdc'],
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should download credential', async () => {
    const response = new ArrayBuffer(8);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.download({id: '1'}, 'pem');

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'download_credential',
        package_format: 'pem',
        credential_id: '1',
      },
      responseType: 'arraybuffer',
    });

    expect(resp).toEqual(response);
  });

  test('should get element from root', () => {
    const fakeHttp = createHttp();
    const root = {
      get_credential: {
        get_credentials_response: {
          credential: {id: '1', name: 'test-credential'},
        },
      },
    };

    const cmd = new CredentialCommand(fakeHttp);
    const element = cmd.getElementFromRoot(root);

    expect(element).toEqual({id: '1', name: 'test-credential'});
  });
});
