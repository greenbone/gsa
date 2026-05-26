/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentGroupCommand from 'gmp/commands/agent-group';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {type Element} from 'gmp/models/model';

const createAgentGroupResponse = (data: Element) =>
  createEntityResponse('agent_group', data, {
    responseName: 'get_agent_group_response',
  });

describe('AgentGroupCommand tests', () => {
  test('should allow to get an agent group', async () => {
    const entityResponse = createAgentGroupResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentGroupCommand(http);
    const result = await command.get({id: '324'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_group', agent_group_id: '324'},
    });
    expect(result.data.id).toEqual('324');
  });

  test('should allow to delete an agent group', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new AgentGroupCommand(http);
    await command.delete({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'delete_agent_group', agent_group_id: '324'},
    });
  });

  test('should allow to create an agent group', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentGroupCommand(http);

    const result = await command.create({
      name: 'Test Agent Group',
      comment: 'some comment',
      scannerId: '12',
      agentIds: ['1', '2', '3'],
      schedulerCronTime: '0 0 * * *',
    });

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_agent_group',
        name: 'Test Agent Group',
        comment: 'some comment',
        scanner_id: '12',
        'agent_ids:': ['1', '2', '3'],
        scheduler_cron_time: '0 0 * * *',
      },
    });

    expect(result.data.id).toEqual('324');
  });

  test('should allow to save an agent group', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentGroupCommand(http);

    const result = await command.save({
      id: '324',
      name: 'Test Agent Group',
      comment: 'some comment',
      scannerId: '12',
      agentIds: ['1', '2', '3'],
      schedulerCronTime: '0 */12 * * *',
    });

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_agent_group',
        agent_group_id: '324',
        name: 'Test Agent Group',
        comment: 'some comment',
        scanner_id: '12',
        'agent_ids:': ['1', '2', '3'],
        scheduler_cron_time: '0 */12 * * *',
      },
    });

    expect(result).toBeUndefined();
  });

  test("should allow to clone an agent group's", async () => {
    const entityResponse = createActionResultResponse({id: '999'});
    const http = createHttp(entityResponse);
    const command = new AgentGroupCommand(http);
    const result = await command.clone({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        resource_type: 'agent_group',
        id: '324',
      },
    });
    expect(result.data.id).toEqual('999');
  });

  test("should allow to export an agent group's", async () => {
    const fakeFile = new ArrayBuffer(8);
    const http = createHttp(fakeFile);
    const command = new AgentGroupCommand(http);
    const result = await command.export({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'agent_group',
        bulk_select: 1,
        ['bulk_selected:324']: 1,
      },
    });
    expect(result).toBe(fakeFile);
  });
});
