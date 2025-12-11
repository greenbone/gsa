/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CredentialCommand from 'gmp/commands/credential';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing';
import {
  CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

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

  test('should create KRB5 credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.create({
      name: 'krb5-credential',
      comment: 'KRB5 credential',
      credentialType: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'krb5user',
      password: 'krb5password',
      realm: 'EXAMPLE.COM',
      kdcs: ['kdc1.example.com', 'kdc2.example.com'],
      hostIdentifier: 'host123',
      vaultId: 'vault456',
      certificate,
      privateKey,
      publicKey,
      passphrase: 'test-passphrase',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        autogenerate: 0,
        certificate,
        comment: 'KRB5 credential',
        community: undefined,
        credential_login: 'krb5user',
        credential_type: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
        host_identifier: 'host123',
        lsc_password: 'krb5password',
        name: 'krb5-credential',
        passphrase: 'test-passphrase',
        private_key: privateKey,
        public_key: publicKey,
        vault_id: 'vault456',
        realm: 'EXAMPLE.COM',
        'kdcs:': ['kdc1.example.com', 'kdc2.example.com'],
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should create SNMP credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.create({
      name: 'snmp-credential',
      comment: 'SNMP credential',
      credentialType: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
      credentialLogin: 'snmpuser',
      password: 'snmppassword',
      authAlgorithm: 'md5',
      privacyAlgorithm: 'des',
      privacyPassword: 'privacypass',
      hostIdentifier: 'snmp-host',
      privacyHostIdentifier: 'privacy-host',
      vaultId: 'snmp-vault',
      community: 'public',
      certificate,
      privateKey,
      publicKey,
      passphrase: 'snmp-passphrase',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: 'md5',
        autogenerate: 0,
        certificate,
        comment: 'SNMP credential',
        community: 'public',
        credential_login: 'snmpuser',
        credential_type: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
        host_identifier: 'snmp-host',
        lsc_password: 'snmppassword',
        name: 'snmp-credential',
        passphrase: 'snmp-passphrase',
        privacy_algorithm: 'des',
        privacy_password: 'privacypass',
        private_key: privateKey,
        public_key: publicKey,
        vault_id: 'snmp-vault',
        privacy_host_identifier: 'privacy-host',
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

  test('should keep files when saving credential', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.save({
      id: '2',
      name: 'keep-files-credential',
      certificate: new File([], 'empty.pem'),
      privateKey: new File([], 'empty.key'),
      publicKey: new File([], 'empty.pub'),
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        'kdcs:': undefined,
        auth_algorithm: undefined,
        certificate: undefined,
        comment: undefined,
        community: undefined,
        credential_id: '2',
        credential_login: undefined,
        credential_type: undefined,
        host_identifier: undefined,
        name: 'keep-files-credential',
        passphrase: undefined,
        password: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        realm: undefined,
        vault_id: undefined,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should remove files when saving credential', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.save({
      id: '2',
      name: 'remove-files-credential',
      certificate: null,
      privateKey: null,
      publicKey: null,
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        'kdcs:': undefined,
        auth_algorithm: undefined,
        certificate: '',
        comment: undefined,
        community: undefined,
        credential_id: '2',
        credential_login: undefined,
        credential_type: undefined,
        name: 'remove-files-credential',
        passphrase: undefined,
        password: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: '',
        public_key: '',
        realm: undefined,
        vault_id: undefined,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should save KRB5 credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.save({
      id: 'krb5-id',
      name: 'updated-krb5-credential',
      comment: 'Updated KRB5 credential',
      credentialType: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'updated-krb5user',
      password: 'updated-password',
      realm: 'UPDATED.COM',
      kdcs: ['new-kdc.example.com'],
      hostIdentifier: 'new-host',
      vaultId: 'new-vault',
      certificate,
      privateKey,
      publicKey,
      passphrase: 'new-passphrase',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        certificate,
        comment: 'Updated KRB5 credential',
        community: undefined,
        credential_login: 'updated-krb5user',
        credential_type: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
        credential_id: 'krb5-id',
        password: 'updated-password',
        name: 'updated-krb5-credential',
        passphrase: 'new-passphrase',
        private_key: privateKey,
        public_key: publicKey,
        vault_id: 'new-vault',
        host_identifier: 'new-host',
        realm: 'UPDATED.COM',
        'kdcs:': ['new-kdc.example.com'],
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should save SNMP credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.save({
      id: 'snmp-id',
      name: 'updated-snmp-credential',
      comment: 'Updated SNMP credential',
      credentialType: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
      credentialLogin: 'updated-snmpuser',
      password: 'updated-snmppassword',
      authAlgorithm: 'sha1',
      privacyAlgorithm: 'aes',
      privacyPassword: 'updated-privacypass',
      hostIdentifier: 'updated-snmp-host',
      privacyHostIdentifier: 'updated-privacy-host',
      vaultId: 'updated-snmp-vault',
      community: 'private',
      certificate,
      privateKey,
      publicKey,
      passphrase: 'updated-snmp-passphrase',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        auth_algorithm: 'sha1',
        certificate,
        comment: 'Updated SNMP credential',
        community: 'private',
        credential_login: 'updated-snmpuser',
        credential_type: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
        credential_id: 'snmp-id',
        password: 'updated-snmppassword',
        name: 'updated-snmp-credential',
        passphrase: 'updated-snmp-passphrase',
        privacy_algorithm: 'aes',
        privacy_password: 'updated-privacypass',
        private_key: privateKey,
        public_key: publicKey,
        vault_id: 'updated-snmp-vault',
        host_identifier: 'updated-snmp-host',
        privacy_host_identifier: 'updated-privacy-host',
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
