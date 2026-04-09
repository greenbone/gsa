/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AuditsCommand from 'gmp/commands/audits';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';

describe('AuditsCommand tests', () => {
  test('should return all audits', async () => {
    const response = createEntitiesResponse('task', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    const cmd = new AuditsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tasks',
        filter: ALL_FILTER.toFilterString(),
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return audits', async () => {
    const response = createEntitiesResponse('task', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    const cmd = new AuditsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tasks',
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });
});
