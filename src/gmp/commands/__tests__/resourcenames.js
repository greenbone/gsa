/* Copyright (C) 2023 Greenbone AG
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
import {createResponse, createHttp} from '../testing';

import {ResourceNamesCommand} from '../resourcenames';

describe('ResourceNamesCommand tests', () => {
  test('should return resource names', () => {
    const response = createResponse({
      get_resource_names: {
        get_resource_names_response: {
          type: 'os',
          resource: [
            {
              name: 'cpe:/o:canonical:ubuntu_linux:18.04',
              _id: '5b6b6aef-b320-42ca-899f-3161ee2a4195',
            },
            {
              name: 'cpe:/o:debian:debian_linux',
              _id: 'f2fa6833-fe34-4e04-a60c-6c5dc1ed0fcf',
            },
            {
              name: 'cpe:/o:microsoft:windows',
              _id: '19c091f0-a687-4dc3-b482-7d191ead4bb3',
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new ResourceNamesCommand(fakeHttp);
    return cmd.getAll({resource_type: 'os'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_resource_names',
          filter: 'first=1 rows=-1',
          resource_type: 'os',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(3);
      expect(data[0].id).toEqual('5b6b6aef-b320-42ca-899f-3161ee2a4195');
      expect(data[0].name).toEqual('cpe:/o:canonical:ubuntu_linux:18.04');
      expect(data[0].type).toEqual('os');

      expect(data[1].id).toEqual('f2fa6833-fe34-4e04-a60c-6c5dc1ed0fcf');
      expect(data[1].name).toEqual('cpe:/o:debian:debian_linux');
      expect(data[1].type).toEqual('os');

      expect(data[2].id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bb3');
      expect(data[2].name).toEqual('cpe:/o:microsoft:windows');
      expect(data[2].type).toEqual('os');
    });
  });

  test('should return names from one resource', () => {
    const response = createResponse({
      get_resource_names: {
        get_resource_names_response: {
          type: 'filter',
          resource: {
            name: 'Filter_1',
            _id: 'b0059c62-ce13-4ef0-adb7-75a04757668b',
          },
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new ResourceNamesCommand(fakeHttp);
    return cmd.getAll({resource_type: 'filter'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_resource_names',
          filter: 'first=1 rows=-1',
          resource_type: 'filter',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(1);
      expect(data[0].id).toEqual('b0059c62-ce13-4ef0-adb7-75a04757668b');
      expect(data[0].name).toEqual('Filter_1');
      expect(data[0].type).toEqual('filter');
    });
  });

  test('should return no names', () => {
    const response = createResponse({
      get_resource_names: {
        get_resource_names_response: {
          type: 'note',
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new ResourceNamesCommand(fakeHttp);
    return cmd.getAll({resource_type: 'note'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_resource_names',
          filter: 'first=1 rows=-1',
          resource_type: 'note',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(0);
    });
  });

  test('should throw not implemented exception', () => {
    const response = createResponse({
      get_resource_names: {
        get_resource_names_response: {
          type: 'note',
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new ResourceNamesCommand(fakeHttp);
    expect(() => {
      cmd.export();
    }).toThrow();
    expect(() => {
      cmd.exportByIds();
    }).toThrow();
    expect(() => {
      cmd.exportByFilter();
    }).toThrow();
    expect(() => {
      cmd.delete();
    }).toThrow();
    expect(() => {
      cmd.deleteByIds();
    }).toThrow();
    expect(() => {
      cmd.deleteByFilter();
    }).toThrow();
    expect(() => {
      cmd.transformAggregates();
    }).toThrow();
    expect(() => {
      cmd.getAggregates();
    }).toThrow();
  });
});
