/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {NvtFamiliesCommand} from '../nvtfamilies';

import {createResponse, createHttp} from '../testing';

describe('NvtFamiliesCommand tests', () => {
  test('should load nvt families', () => {
    const response = createResponse({
      get_nvt_families: {
        get_nvt_families_response: {
          families: {
            family: [
              {
                name: 'foo',
                max_nvt_count: '1000',
              },
              {
                name: 'bar',
                max_nvt_count: '666',
              },
            ],
          },
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new NvtFamiliesCommand(fakeHttp);
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_nvt_families',
        },
      });

      const {data: families} = resp;

      expect(families.length).toEqual(2);
      expect(families[0].name).toEqual('foo');
      expect(families[0].maxNvtCount).toEqual(1000);
      expect(families[1].name).toEqual('bar');
      expect(families[1].maxNvtCount).toEqual(666);
    });
  });
});
