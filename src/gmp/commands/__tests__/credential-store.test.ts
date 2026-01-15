/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import CredentialStoreCommand from 'gmp/commands/credential-store';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

const createCredentialStoreResponse = (data: Record<string, unknown>) =>
  createEntityResponse('credential_store', data);

describe('CredentialStoreCommand tests', () => {
  test('should allow to get a credential store', async () => {
    const entityResponse = createCredentialStoreResponse({id: '123'});
    const http = createHttp(entityResponse);
    const command = new CredentialStoreCommand(http);
    const result = await command.get({id: '123'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_credential_store', credential_store_id: '123'},
    });
    expect(result.data.id).toEqual('123');
  });

  test('should allow to delete a credential store', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new CredentialStoreCommand(http);
    await command.delete({id: '123'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'delete_credential_store', credential_store_id: '123'},
    });
  });

  test('should allow to modify a credential store', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new CredentialStoreCommand(http);

    const clientCertificate = new File(['cert'], 'cert.pem');
    const clientKey = new File(['key'], 'key.pem');
    const pkcs12File = new File(['pkcs12'], 'cert.p12');
    const serverCaCertificate = new File(['ca'], 'ca.pem');

    await command.edit({
      id: '123',
      active: true,
      appId: 'app123',
      host: 'example.com',
      path: '/path',
      port: '443',
      comment: 'Test comment',
      clientCertificate,
      clientKey,
      pkcs12File,
      passphrase: 'secret',
      serverCaCertificate,
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_credential_store',
        credential_store_id: '123',
        active: YES_VALUE,
        host: 'example.com',
        path: '/path',
        port: '443',
        comment: 'Test comment',
        'preferences:app_id': 'app123',
        'preferences:client_certificate': clientCertificate,
        'preferences:client_key': clientKey,
        'preferences:pkcs12_file': pkcs12File,
        'preferences:passphrase': 'secret',
        'preferences:server_ca_certificate': serverCaCertificate,
      },
    });
  });

  test('should allow to modify a credential store with minimal params', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new CredentialStoreCommand(http);

    await command.edit({
      id: '123',
      active: false,
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_credential_store',
        credential_store_id: '123',
        active: NO_VALUE,
        host: undefined,
        path: undefined,
        port: undefined,
        comment: undefined,
        'preferences:app_id': undefined,
        'preferences:client_certificate': undefined,
        'preferences:client_key': undefined,
        'preferences:pkcs12_file': undefined,
        'preferences:passphrase': undefined,
        'preferences:server_ca_certificate': undefined,
      },
    });
  });

  test('should allow to verify a credential store', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new CredentialStoreCommand(http);

    await command.verify({id: '123'});

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'verify_credential_store',
        credential_store_id: '123',
      },
    });
  });
});
