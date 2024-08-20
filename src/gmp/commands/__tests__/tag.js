/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
