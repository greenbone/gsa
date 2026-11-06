/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentGroupCommand from 'gmp/commands/agent-group';
import {
  createActionResultResponse,
  createEntitiesResponse,
  createHttp,
  createPlainResponse,
} from 'gmp/commands/testing';

describe('AgentGroupCommand tests', () => {
  test('should get an agent group through the plural list endpoint', async () => {
    const entityResponse = createEntitiesResponse('agent_group', [
      {
        _id: '324',
        name: 'Office agents',
        agents: {
          agent: {_id: 'agent-1', name: 'Laptop'},
        },
        scheduler_cron_time: '0 */12 * * *',
        max_delay_seconds: '300',
      },
    ]);
    const http = createHttp(entityResponse);
    const command = new AgentGroupCommand(http);
    const result = await command.get({id: '324'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_groups', filter: 'uuid=324 first=1 rows=-1'},
    });
    expect(result.data.id).toEqual('324');
    expect(result.data.name).toEqual('Office agents');
    expect(result.data.agents).toEqual([{id: 'agent-1', name: 'Laptop'}]);
    expect(result.data.schedulerCronTime).toEqual('0 */12 * * *');
    expect(result.data.maxDelaySeconds).toEqual(300);
  });

  test('should select the requested group from a collection', async () => {
    const response = createEntitiesResponse('agent_group', [
      {_id: 'other', name: 'Other group'},
      {_id: 'requested', name: 'Requested group'},
    ]);
    const command = new AgentGroupCommand(createHttp(response));
    const result = await command.get({id: 'requested'});

    expect(result.data.id).toEqual('requested');
    expect(result.data.name).toEqual('Requested group');
  });

  test.each([{groups: []}, {groups: [{_id: 'other', name: 'Other group'}]}])(
    'should report a missing group instead of returning undefined',
    async ({groups}) => {
      const command = new AgentGroupCommand(
        createHttp(createEntitiesResponse('agent_group', groups)),
      );
      await expect(command.get({id: 'missing'})).rejects.toThrow(
        'The Agent Group you were looking for could not be found.',
      );
    },
  );

  test('should parse a single group in an XML list response', async () => {
    const http = createHttp(
      createPlainResponse(`
      <envelope>
        <get_agent_groups>
          <get_agent_groups_response status="200" status_text="OK">
            <agent_group id="requested">
              <name>Office agents</name>
              <agents><agent id="agent-1"><name>Laptop</name></agent></agents>
              <scheduler_cron_time>0 */12 * * *</scheduler_cron_time>
              <max_delay_seconds>300</max_delay_seconds>
            </agent_group>
          </get_agent_groups_response>
        </get_agent_groups>
      </envelope>`),
    );
    const result = await new AgentGroupCommand(http).get({id: 'requested'});

    expect(result.data.id).toEqual('requested');
    expect(result.data.name).toEqual('Office agents');
    expect(result.data.agents).toEqual([{id: 'agent-1', name: 'Laptop'}]);
  });

  test('should preserve additional filters and remove pagination for the lookup', async () => {
    const http = createHttp(
      createEntitiesResponse('agent_group', [{_id: 'requested'}]),
    );
    const command = new AgentGroupCommand(http);
    await command.get(
      {id: 'requested'},
      {filter: 'name=Office first=21 rows=10'},
    );

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_groups',
        filter: 'name=Office first=1 rows=-1 uuid=requested',
      },
    });
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
        max_delay_seconds: 0,
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
        max_delay_seconds: 0,
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
