/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import TagCommand from 'gmp/commands/tag';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {type EntityType} from 'gmp/utils/entity-type';

describe('TagCommand tests', () => {
  test('should create new tag with resources', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'name',
      comment: 'comment',
      active: true,
      resourceIds: ['id1', 'id2'],
      resourceType: 'task',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_tag',
        tag_name: 'name',
        comment: 'comment',
        active: YES_VALUE,
        'resource_ids:': ['id1', 'id2'],
        resource_type: 'task',
        tag_value: '',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test.each([
    {entityType: 'task', resourceType: 'task'},
    {entityType: 'scanconfig', resourceType: 'config'},
    {entityType: 'host', resourceType: 'host'},
    {entityType: 'reportconfig', resourceType: 'report_config'},
    {entityType: 'report', resourceType: 'report'},
    {entityType: 'certbund', resourceType: 'cert_bund_adv'},
    {entityType: 'cve', resourceType: 'cve'},
  ])(
    'should create tag for resource type $entityType',
    async ({entityType, resourceType}) => {
      const response = createActionResultResponse();
      const fakeHttp = createHttp(response);
      const cmd = new TagCommand(fakeHttp);
      const resp = await cmd.create({
        name: 'name',
        comment: 'comment',
        active: true,
        resourceIds: ['id1', 'id2'],
        resourceType: entityType as EntityType,
      });
      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: {
          cmd: 'create_tag',
          tag_name: 'name',
          comment: 'comment',
          active: YES_VALUE,
          'resource_ids:': ['id1', 'id2'],
          resource_type: resourceType,
          tag_value: '',
        },
      });
      const {data} = resp;
      expect(data.id).toEqual('foo');
    },
  );

  test('should create new tag with filter', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'name',
      comment: 'comment',
      active: true,
      filter: 'some filter',
      resourceType: 'task',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_tag',
        tag_name: 'name',
        comment: 'comment',
        active: YES_VALUE,
        filter: 'some filter',
        resource_type: 'task',
        tag_value: '',
      },
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
      active: true,
      resourceIds: ['id1'],
      resourceType: 'task',
      resourcesAction: 'add',
      value: 'lorem',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_tag',
        tag_id: 'foo',
        tag_name: 'bar',
        comment: 'ipsum',
        active: YES_VALUE,
        'resource_ids:': ['id1'],
        resource_type: 'task',
        resources_action: 'add',
        tag_value: 'lorem',
      },
    });
  });

  test('should save a tag with filter', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TagCommand(fakeHttp);
    await cmd.save({
      id: 'foo',
      name: 'bar',
      comment: 'ipsum',
      active: true,
      filter: 'some filter',
      resourceIds: ['id1'],
      resourceType: 'task',
      resourcesAction: 'add',
      value: 'lorem',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_tag',
        tag_id: 'foo',
        tag_name: 'bar',
        comment: 'ipsum',
        active: YES_VALUE,
        filter: 'some filter',
        'resource_ids:': ['id1'],
        resource_type: 'task',
        resources_action: 'add',
        tag_value: 'lorem',
      },
    });
  });

  test.each([
    {entityType: 'task', resourceType: 'task'},
    {entityType: 'scanconfig', resourceType: 'config'},
    {entityType: 'host', resourceType: 'host'},
    {entityType: 'reportconfig', resourceType: 'report_config'},
    {entityType: 'report', resourceType: 'report'},
    {entityType: 'certbund', resourceType: 'cert_bund_adv'},
    {entityType: 'cve', resourceType: 'cve'},
  ])(
    'should save tag for resource type $entityType',
    async ({entityType, resourceType}) => {
      const response = createActionResultResponse();
      const fakeHttp = createHttp(response);
      const cmd = new TagCommand(fakeHttp);
      await cmd.save({
        id: 'foo',
        active: true,
        name: 'bar',
        resourceType: entityType as EntityType,
      });
      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: {
          cmd: 'save_tag',
          comment: '',
          tag_id: 'foo',
          tag_name: 'bar',
          active: YES_VALUE,
          resource_type: resourceType,
          tag_value: '',
        },
      });
    },
  );

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
        enable: YES_VALUE,
      },
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
        enable: NO_VALUE,
      },
    });
  });
});
