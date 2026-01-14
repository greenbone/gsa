/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import CredentialStoresCommand from 'gmp/commands/credential-stores';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import CredentialStore from 'gmp/models/credential-store';

describe('CredentialStoresCommand tests', () => {
  test('should fetch credential stores', async () => {
    const response = createEntitiesResponse('credential_store', [
      {_id: '1', name: 'Store 1'},
      {_id: '2', name: 'Store 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialStoresCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_credential_stores'},
    });
    expect(resp.data).toEqual([
      new CredentialStore({id: '1', name: 'Store 1'}),
      new CredentialStore({id: '2', name: 'Store 2'}),
    ]);
  });

  test('should fetch credential stores with custom filter', async () => {
    const response = createEntitiesResponse('credential_store', [
      {_id: '2', name: 'Store 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialStoresCommand(fakeHttp);
    const resp = await cmd.get({filter: "name='Store 2'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_credential_stores',
        filter: "name='Store 2'",
      },
    });
    expect(resp.data).toEqual([
      new CredentialStore({id: '2', name: 'Store 2'}),
    ]);
  });

  test('should fetch all credential stores', async () => {
    const response = createEntitiesResponse('credential_store', [
      {_id: '3', name: 'Store 3'},
      {_id: '4', name: 'Store 4'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialStoresCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_credential_stores', filter: 'first=1 rows=-1'},
    });
    expect(resp.data).toEqual([
      new CredentialStore({id: '3', name: 'Store 3'}),
      new CredentialStore({id: '4', name: 'Store 4'}),
    ]);
  });
});
