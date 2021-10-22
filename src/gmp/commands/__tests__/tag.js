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
import {TagCommand} from '../tags';

import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from '../testing';

describe('TagCommand tests', () => {
  test('should create new tag with resources', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TagCommand(fakeHttp);
    return cmd
      .create({
        name: 'name',
        comment: 'comment',
        active: '1',
        resource_ids: ['id1', 'id2'],
        resource_type: 'type',
        resources_action: 'action',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_tag',
            tag_name: 'name',
            comment: 'comment',
            active: '1',
            'resource_ids:': ['id1', 'id2'],
            resource_type: 'type',
            resources_action: 'action',
            tag_value: '',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should return single tag', () => {
    const response = createEntityResponse('tag', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TagCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tag',
          tag_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

  test('should save a tag', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TagCommand(fakeHttp);
    return cmd
      .save({
        id: 'foo',
        name: 'bar',
        comment: 'ipsum',
        active: '1',
        filter: 'fil',
        resource_ids: ['id1'],
        resource_type: 'type',
        resources_action: 'action',
        value: 'lorem',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_tag',
            tag_id: 'foo',
            tag_name: 'bar',
            comment: 'ipsum',
            active: '1',
            filter: 'fil',
            'resource_ids:': ['id1'],
            resource_type: 'type',
            resources_action: 'action',
            tag_value: 'lorem',
          },
        });
      });
  });

  test('should enable a tag', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TagCommand(fakeHttp);
    return cmd
      .enable({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'toggle_tag',
            tag_id: 'foo',
            enable: '1',
          },
        });
      });
  });

  test('should disable a tag', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TagCommand(fakeHttp);
    return cmd
      .disable({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'toggle_tag',
            tag_id: 'foo',
            enable: '0',
          },
        });
      });
  });
});
