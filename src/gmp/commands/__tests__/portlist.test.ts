/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FROM_FILE, PortListCommand} from 'gmp/commands/portlists';
import {
  createHttp,
  createActionResultResponse,
  createHttpMany,
  createEntityResponse,
  createResponse,
} from 'gmp/commands/testing';

describe('PortListCommand', () => {
  test('should allow to create a port list', async () => {
    const response = createActionResultResponse({
      action: 'create_port_list',
      id: '12345',
    });

    const http = createHttp(response);
    const command = new PortListCommand(http);

    const params = {
      name: 'Test Port List',
      comment: 'This is a test port list',
      portRange: 'tcp:1-1000',
    };

    const result = await command.create(params);

    expect(result.data).toEqual({
      id: '12345',
      message: 'OK',
      action: 'create_port_list',
    });
  });

  test('should allow to create port list from file', async () => {
    const response = createActionResultResponse({
      action: 'create_port_list',
      id: '12345',
    });
    const http = createHttp(response);
    const command = new PortListCommand(http);
    const result = await command.create({
      name: 'Test Port List',
      comment: 'This is a test port list',
      fromFile: FROM_FILE,
      file: 'some file content',
    });
    expect(result.data).toEqual({
      id: '12345',
      message: 'OK',
      action: 'create_port_list',
    });
  });

  test('should allow to save a port list', async () => {
    const response = createActionResultResponse({
      action: 'save_port_list',
      id: '12345',
    });
    const http = createHttp(response);
    const command = new PortListCommand(http);
    const result = await command.save({
      id: '12345',
      name: 'Test Port List',
      comment: 'This is a test port list',
    });
    expect(result.data).toEqual({
      id: '12345',
      message: 'OK',
      action: 'save_port_list',
    });
  });

  test('should allow to create a port range', async () => {
    const response = createActionResultResponse({
      action: 'create_port_range',
      id: '12345',
    });
    const http = createHttp(response);
    const command = new PortListCommand(http);
    const result = await command.createPortRange({
      portListId: '12345',
      portRangeStart: 1,
      portRangeEnd: 1000,
      portType: 'tcp',
    });
    expect(result.data).toEqual({
      id: '12345',
      message: 'OK',
      action: 'create_port_range',
    });
  });

  test('should allow to delete a port range', async () => {
    const response = createActionResultResponse({
      action: 'delete_port_range',
      id: '12345',
    });
    const entityResponse = createEntityResponse('port_list', {id: '324'});
    const http = createHttpMany([response, entityResponse]);
    const command = new PortListCommand(http);
    const result = await command.deletePortRange({
      id: '12345',
      portListId: '67890',
    });
    expect(result.data.id).toEqual('324');
  });

  test('should allow to get a port list', async () => {
    const entityResponse = createEntityResponse('port_list', {id: '324'});
    const http = createHttp(entityResponse);
    const command = new PortListCommand(http);
    const result = await command.get({id: '324'});
    expect(result.data.id).toEqual('324');
  });

  test('should allow to import a port list', async () => {
    const response = createResponse({});
    const http = createHttp(response);
    const command = new PortListCommand(http);
    const result = await command.import({
      xmlFile: 'some file content',
    });
    expect(result.data).toEqual({});
  });
});
