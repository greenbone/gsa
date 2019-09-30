/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import Filter from 'gmp/models/filter';

import {createEntitiesResponse, createHttp} from '../testing';

import EntitiesCommand from '../entities';

describe('EntitiesCommand tests', () => {
  test('should add filter parameter', () => {
    const filter = Filter.fromString('foo=bar');
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    return cmd.get({filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foos',
          filter: 'foo=bar',
        },
      });
    });
  });

  test('should add filter_id parameter', () => {
    const filter = Filter.fromElement({_id: 'bar'});
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    return cmd.get({filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foos',
          filter_id: 'bar',
        },
      });
    });
  });

  test('should prefer filter_id over filter parameter', () => {
    const filter = Filter.fromElement({
      _id: 'bar',
      keywords: {
        keyword: {relation: '=', value: 'bar', column: 'foo'},
      },
    });
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect(filter.toFilterString()).toEqual('foo=bar');

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    return cmd.get({filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foos',
          filter_id: 'bar',
        },
      });
    });
  });
});
