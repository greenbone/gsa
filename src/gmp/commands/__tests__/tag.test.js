/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {TagCommand} from 'gmp/commands/tags';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import transform from 'gmp/http/transform/fastxml';

describe('TagCommand tests', () => {
  test('should create new tag with resources', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'name',
      comment: 'comment',
      active: '1',
      resource_ids: ['id1', 'id2'],
      resource_type: 'type',
      resources_action: 'action',
    });
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
      transform,
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should return single tag', async () => {
    const response = createEntityResponse('tag', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tag',
        tag_id: 'foo',
      },
      transform,
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save a tag', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    await cmd.save({
      id: 'foo',
      name: 'bar',
      comment: 'ipsum',
      active: '1',
      filter: 'fil',
      resource_ids: ['id1'],
      resource_type: 'type',
      resources_action: 'action',
      value: 'lorem',
    });
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
      transform,
    });
  });

  test('should enable a tag', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    await cmd.enable({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'toggle_tag',
        tag_id: 'foo',
        enable: '1',
      },
      transform,
    });
  });

  test('should disable a tag', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    await cmd.disable({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'toggle_tag',
        tag_id: 'foo',
        enable: '0',
      },
      transform,
    });
  });
});
