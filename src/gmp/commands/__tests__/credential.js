/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {CredentialCommand} from 'gmp/commands/credentials.js';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing.js';
import DefaultTransform from 'gmp/http/transform/default';

describe('CredentialCommand tests', () => {
  test('should create credential', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.create({name: 'test-credential'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_credential',
        name: 'test-credential',
        comment: '',
        allow_insecure: 0,
        autogenerate: 0,
        community: '',
        credential_login: '',
        lsc_password: '',
        passphrase: '',
        privacy_password: '',
        auth_algorithm: 'sha1',
        privacy_algorithm: 'aes',
        private_key: undefined,
        public_key: undefined,
        certificate: undefined,
        realm: undefined,
        kdc: undefined,
        credential_type: undefined,
      },
    });

    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save credential', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.save({
      id: '1',
      name: 'updated-credential',
      comment: 'updated comment',
      allow_insecure: 1,
      auth_algorithm: 'md5',
      certificate: 'cert',
      change_community: 1,
      change_passphrase: 1,
      change_password: 1,
      change_privacy_password: 1,
      community: 'community',
      credential_login: 'login',
      credential_type: 'type',
      passphrase: 'passphrase',
      password: 'password',
      privacy_algorithm: 'des',
      privacy_password: 'privacy_password',
      private_key: 'private_key',
      public_key: 'public_key',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_credential',
        credential_id: '1',
        name: 'updated-credential',
        comment: 'updated comment',
        allow_insecure: 1,
        auth_algorithm: 'md5',
        certificate: 'cert',
        change_community: 1,
        change_passphrase: 1,
        change_password: 1,
        change_privacy_password: 1,
        community: 'community',
        credential_login: 'login',
        credential_type: 'type',
        passphrase: 'passphrase',
        password: 'password',
        privacy_algorithm: 'des',
        privacy_password: 'privacy_password',
        private_key: 'private_key',
        public_key: 'public_key',
      },
    });

    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should download credential', async () => {
    const response = new ArrayBuffer(8);
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new CredentialCommand(fakeHttp);
    const resp = await cmd.download({id: '1'}, 'pem');

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'download_credential',
        package_format: 'pem',
        credential_id: '1',
      },
      transform: DefaultTransform,
      responseType: 'arraybuffer',
    });

    expect(resp).toEqual(response);
  });

  test('should get element from root', () => {
    const root = {
      // eslint-disable-next-line camelcase
      get_credential: {
        // eslint-disable-next-line camelcase
        get_credentials_response: {
          credential: {id: '1', name: 'test-credential'},
        },
      },
    };

    const cmd = new CredentialCommand();
    const element = cmd.getElementFromRoot(root);

    expect(element).toEqual({id: '1', name: 'test-credential'});
  });
});
