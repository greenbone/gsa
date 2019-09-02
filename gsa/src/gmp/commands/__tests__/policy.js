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
import {ALL_FILTER} from 'gmp/models/filter';

import {
  createActionResultResponse,
  createEntityResponse,
  createEntitiesResponse,
  createHttp,
} from '../testing';

import {PolicyCommand, PoliciesCommand} from '../policies';

describe('PolicyCommand tests', () => {
  test('should create new policy', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .create({
        base: 0,
        comment: 'bar',
        name: 'foo',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_config',
            base: 0,
            comment: 'bar',
            name: 'foo',
            scanner_id: undefined,
            usage_type: 'policy',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should create new policy with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .create({
        base: 0,
        comment: 'bar',
        name: 'foo',
        scanner_id: 1,
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_config',
            base: 0,
            comment: 'bar',
            name: 'foo',
            scanner_id: 1,
            usage_type: 'policy',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should save policy', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .save({
        id: '123',
        name: 'foo',
        comment: 'bar',
        trend: {},
        select: {},
        scanner_preference_values: {},
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config',
            config_id: '123',
            name: 'foo',
            comment: 'bar',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should save policy with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .save({
        id: '123',
        name: 'foo',
        comment: 'bar',
        trend: {family1: 0, family2: 1},
        select: {family1: 1, family2: 0},
        scanner_preference_values: {},
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config',
            config_id: '123',
            name: 'foo',
            comment: 'bar',
            'select:family1': 1,
            'trend:family1': 0,
            'trend:family2': 1,
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should return single policy', () => {
    const response = createEntityResponse('config', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_config',
          config_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });
});

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
