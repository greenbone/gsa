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
  KRB5_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

const certificate = new File(['cert'], 'cert.pem');
const privateKey = new File(['private_key'], 'key.pem');
const publicKey = new File(['public_key'], 'key.pub');

describe('CredentialCommand tests', () => {
  test('should create KRB5 credential with empty kdcs', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.createKrb5({
      name: 'krb5-empty-kdcs',
      comment: 'KRB5 credential with empty kdcs',
      credentialType: KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'krb5user',
      password: 'krb5password',
      realm: 'EXAMPLE.COM',
      kdcs: [], // Empty array
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: undefined,
        autogenerate: 0,
        certificate: undefined,
        comment: 'KRB5 credential with empty kdcs',
        community: undefined,
        credential_login: 'krb5user',
        credential_type: KRB5_CREDENTIAL_TYPE,
        lsc_password: 'krb5password',
        name: 'krb5-empty-kdcs',
        passphrase: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        realm: 'EXAMPLE.COM',
        'kdcs:': '', // Should be empty string when kdcs is empty array
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should create KRB5 credential store with empty kdcs', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.createCredentialStoreKrb5({
      name: 'krb5-store-empty-kdcs',
      comment: 'KRB5 credential store with empty kdcs',
      credentialType: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'krb5user',
      password: 'krb5password',
      realm: 'EXAMPLE.COM',
      kdcs: [], // Empty array
      hostIdentifier: 'host123',
      vaultId: 'vault456',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: undefined,
        autogenerate: 0,
        certificate: undefined,
        comment: 'KRB5 credential store with empty kdcs',
        community: undefined,
        credential_login: 'krb5user',
        credential_type: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
        lsc_password: 'krb5password',
        name: 'krb5-store-empty-kdcs',
        passphrase: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        vault_id: 'vault456',
        host_identifier: 'host123',
        realm: 'EXAMPLE.COM',
        'kdcs:': '', // Should be empty string when kdcs is empty array
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should create credential store base', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.createCredentialStore({
      name: 'credential-store',
      vaultId: 'vault123',
      hostIdentifier: 'host456',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: undefined,
        autogenerate: 0,
        certificate: undefined,
        comment: undefined,
        community: undefined,
        credential_login: undefined,
        credential_type: undefined,
        lsc_password: undefined,
        name: 'credential-store',
        passphrase: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        host_identifier: 'host456',
        vault_id: 'vault123',
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should create credential store without privacy host identifier(SNMP)', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.createCredentialStoreSnmp({
      name: 'snmp-credential-store',
      vaultId: 'vault123',
      hostIdentifier: 'host456',
      privacyHostIdentifier: 'privacy-host',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: undefined,
        autogenerate: 0,
        certificate: undefined,
        comment: undefined,
        community: undefined,
        credential_login: undefined,
        credential_type: undefined,
        lsc_password: undefined,
        name: 'snmp-credential-store',
        passphrase: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        host_identifier: 'host456',
        vault_id: 'vault123',
        privacy_host_identifier: 'privacy-host',
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

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
      password: 'password',
      passphrase: 'passphrase',
      privacyAlgorithm: 'des',
      privacyPassword: 'privacy_password',
      privateKey,
      publicKey,
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
        lsc_password: 'password',
        passphrase: 'passphrase',
        privacy_algorithm: 'des',
        privacy_password: 'privacy_password',
        private_key: privateKey,
        public_key: publicKey,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should create KRB5 credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.createCredentialStoreKrb5({
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
        auth_algorithm: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        privacy_host_identifier: undefined,
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should create regular KRB5 credential with KDC validation', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.createKrb5({
      name: 'krb5-regular-credential',
      comment: 'Regular KRB5 credential',
      credentialType: KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'krb5user',
      password: 'krb5password',
      realm: 'EXAMPLE.COM',
      kdcs: ['kdc1.example.com', 'kdc2.example.com'],
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        autogenerate: 0,
        certificate: undefined,
        comment: 'Regular KRB5 credential',
        community: undefined,
        credential_login: 'krb5user',
        credential_type: KRB5_CREDENTIAL_TYPE,
        host_identifier: undefined,
        lsc_password: 'krb5password',
        name: 'krb5-regular-credential',
        passphrase: undefined,
        private_key: undefined,
        public_key: undefined,
        vault_id: undefined,
        realm: 'EXAMPLE.COM',
        'kdcs:': ['kdc1.example.com', 'kdc2.example.com'],
        auth_algorithm: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        privacy_host_identifier: undefined,
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should create SNMP credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.createCredentialStoreSnmp({
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
        vault_id: undefined,
        host_identifier: undefined,
        privacy_host_identifier: undefined,
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
        vault_id: undefined,
        host_identifier: undefined,
        privacy_host_identifier: undefined,
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
        vault_id: undefined,
        privacy_host_identifier: undefined,
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
        vault_id: undefined,
        host_identifier: undefined,
        privacy_host_identifier: undefined,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should save KRB5 credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.saveCredentialStoreKrb5({
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
        auth_algorithm: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        privacy_host_identifier: undefined,
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should save regular KRB5 credential with KDC validation', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.saveKrb5({
      id: 'krb5-regular-id',
      name: 'updated-krb5-regular-credential',
      comment: 'Updated regular KRB5 credential',
      credentialType: KRB5_CREDENTIAL_TYPE,
      credentialLogin: 'updated-krb5user',
      password: 'updated-password',
      realm: 'UPDATED.COM',
      kdcs: ['new-kdc.example.com'],
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        certificate: undefined,
        comment: 'Updated regular KRB5 credential',
        community: undefined,
        credential_login: 'updated-krb5user',
        credential_type: KRB5_CREDENTIAL_TYPE,
        credential_id: 'krb5-regular-id',
        password: 'updated-password',
        name: 'updated-krb5-regular-credential',
        passphrase: undefined,
        private_key: undefined,
        public_key: undefined,
        vault_id: undefined,
        host_identifier: undefined,
        realm: 'UPDATED.COM',
        'kdcs:': ['new-kdc.example.com'],
        auth_algorithm: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        privacy_host_identifier: undefined,
      },
    });

    expect(resp.data.id).toEqual('foo');
  });

  test('should save SNMP credential store type', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    const resp = await cmd.saveCredentialStoreSnmp({
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

  test('should test createBase helper function through create method', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    // Test createBase through regular create function
    await cmd.create({
      name: 'base-test',
      comment: 'Testing base functionality',
      autogenerate: false,
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
      credentialLogin: 'testuser',
      password: 'testpass',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        auth_algorithm: undefined,
        autogenerate: 0,
        certificate: undefined,
        comment: 'Testing base functionality',
        community: undefined,
        credential_login: 'testuser',
        credential_type: CERTIFICATE_CREDENTIAL_TYPE,
        lsc_password: 'testpass',
        name: 'base-test',
        passphrase: undefined,
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
      },
    });
  });

  test('should test saveBase helper function through save method', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new CredentialCommand(fakeHttp);

    // Test saveBase through regular save function
    await cmd.save({
      id: 'test-id',
      name: 'base-save-test',
      comment: 'Testing save base functionality',
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
      credentialLogin: 'saveuser',
      password: 'savepass',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        credential_id: 'test-id',
        name: 'base-save-test',
        comment: 'Testing save base functionality',
        auth_algorithm: undefined,
        certificate: undefined,
        community: undefined,
        credential_login: 'saveuser',
        credential_type: CERTIFICATE_CREDENTIAL_TYPE,
        passphrase: undefined,
        password: 'savepass',
        privacy_algorithm: undefined,
        privacy_password: undefined,
        private_key: undefined,
        public_key: undefined,
        vault_id: undefined,
        host_identifier: undefined,
        privacy_host_identifier: undefined,
      },
    });
  });
});
