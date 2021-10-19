/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
