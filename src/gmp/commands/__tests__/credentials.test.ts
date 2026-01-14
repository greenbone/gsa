/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CredentialsCommand from 'gmp/commands/credentials';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';

describe('CredentialCommand tests', () => {
  test('should fetch credentials', async () => {
    const response = createEntitiesResponse('credential', [
      {_id: '1', name: 'Credential 1'},
      {_id: '2', name: 'Credential 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_credentials'},
    });
    expect(resp.data).toEqual([
      expect.objectContaining({id: '1', name: 'Credential 1'}),
      expect.objectContaining({id: '2', name: 'Credential 2'}),
    ]);
  });

  test('should fetch credentials with custom filter', async () => {
    const response = createEntitiesResponse('credential', [
      {_id: '2', name: 'Credential 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialsCommand(fakeHttp);
    const resp = await cmd.get({filter: "name='Credential 2'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_credentials',
        filter: "name='Credential 2'",
      },
    });
    expect(resp.data).toEqual([
      expect.objectContaining({id: '2', name: 'Credential 2'}),
    ]);
  });

  test('should fetch all credentials', async () => {
    const response = createEntitiesResponse('credential', [
      {_id: '3', name: 'Credential 3'},
      {_id: '4', name: 'Credential 4'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CredentialsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_credentials',
        filter: 'first=1 rows=-1',
      },
    });
    expect(resp.data).toEqual([
      expect.objectContaining({id: '3', name: 'Credential 3'}),
      expect.objectContaining({id: '4', name: 'Credential 4'}),
    ]);
  });
});
