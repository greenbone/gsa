/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ALL_FILTER} from 'gmp/models/filter';

import {PoliciesCommand} from '../policies';
import {createEntitiesResponse, createHttp} from '../testing';

describe('PoliciesCommand tests', () => {
  test('should return all policies', () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PoliciesCommand(fakeHttp);
    return cmd.getAll().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_configs',
          filter: ALL_FILTER.toFilterString(),
          usage_type: 'policy',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return policies', () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PoliciesCommand(fakeHttp);
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_configs',
          usage_type: 'policy',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });
});
