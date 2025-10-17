/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {PoliciesCommand} from 'gmp/commands/policies';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import transform from 'gmp/http/transform/fastxml';
import {ALL_FILTER} from 'gmp/models/filter';

describe('PoliciesCommand tests', () => {
  test('should return all policies', async () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new PoliciesCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_configs',
        filter: ALL_FILTER.toFilterString(),
        usage_type: 'policy',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return policies', async () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new PoliciesCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_configs',
        usage_type: 'policy',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });
});
