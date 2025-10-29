/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ResultCommand} from 'gmp/commands/results';
import {createEntityResponse, createHttp} from 'gmp/commands/testing';

describe('ResultCommand tests', () => {
  test('should return single result', async () => {
    const response = createEntityResponse('result', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new ResultCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_result',
        result_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
