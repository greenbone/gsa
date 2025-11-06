/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentsCommand from 'gmp/commands/agents';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
  createActionResultResponse,
  createHttpMany,
} from 'gmp/commands/testing';
import Agent from 'gmp/models/agent';
import Filter from 'gmp/models/filter';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('AgentsCommand tests', () => {
  test('should fetch agent with default params', async () => {
    const response = createEntitiesResponse('agent', [
      {_id: '1', name: 'Agent1'},
      {_id: '2', name: 'Agent2'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agents'},
    });
    expect(result.data).toEqual([
      new Agent({id: '1', name: 'Agent1'}),
      new Agent({id: '2', name: 'Agent2'}),
    ]);
  });

  test('should fetch agent with custom params', async () => {
    const response = createEntitiesResponse('agent', [
      {_id: '3', name: 'Agent3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Agent3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agents',
        filter: "name='Agent3'",
      },
    });
    expect(result.data).toEqual([new Agent({id: '3', name: 'Agent3'})]);
  });

  test('should fetch all agents', async () => {
    const response = createEntitiesResponse('agent', [
      {_id: '4', name: 'Agent4'},
      {_id: '5', name: 'Agent5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agents', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Agent({id: '4', name: 'Agent4'}),
      new Agent({id: '5', name: 'Agent5'}),
    ]);
  });

  test('should allow to get severity aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'High', count: 5, c_count: 10},
        {value: 'Medium', count: 3, c_count: 6},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'task',
        group_column: 'severity',
        filter: 'scanner_type=7 or scanner_type=9',
        usage_type: 'scan',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'High', count: 5, c_count: 10},
        {value: 'Medium', count: 3, c_count: 6},
      ],
    });
  });

  test('should allow to get network aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'Scanner1', count: 7, c_count: 14},
        {value: 'Scanner2', count: 2, c_count: 4},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.getNetworkAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'agent',
        group_column: 'scanner',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'Scanner1', count: 7, c_count: 14},
        {value: 'Scanner2', count: 2, c_count: 4},
      ],
    });
  });

  test('should allow to delete agents by ids', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AgentsCommand(fakeHttp);
    const ids = ['1', '2', '3'];
    const result = await cmd.deleteByIds(ids);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_agent',
        'agent_ids:': ids,
      },
    });
    expect(result.data).toEqual(ids);
  });

  test('should allow to authorize agents', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AgentsCommand(fakeHttp);
    const agents = [new Agent({id: '1'}), new Agent({id: '2'})];
    const result = await cmd.authorize(agents);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent',
        authorized: YES_VALUE,
        'agent_ids:': ['1', '2'],
      },
    });
    expect(result).toBeUndefined();
  });

  test('should allow to authorize agents by filter', async () => {
    const response1 = createEntitiesResponse('agent', [
      {_id: '1', name: 'Agent1'},
      {_id: '2', name: 'Agent2'},
    ]);
    const response2 = createActionResultResponse();
    const fakeHttp = createHttpMany([response1, response2]);
    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.authorizeByFilter(
      Filter.fromString("name='AgentToAuthorize'"),
    );
    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'get', {
      args: {
        cmd: 'get_agents',
        filter: "name='AgentToAuthorize'",
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'modify_agent',
        authorized: YES_VALUE,
        'agent_ids:': ['1', '2'],
      },
    });
    expect(result).toBeUndefined();
  });

  test('should allow to revoke agents', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AgentsCommand(fakeHttp);
    const agents = [new Agent({id: '3'}), new Agent({id: '4'})];
    const result = await cmd.revoke(agents);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent',
        authorized: NO_VALUE,
        'agent_ids:': ['3', '4'],
      },
    });
    expect(result).toBeUndefined();
  });

  test('should allow to revoke agents by filter', async () => {
    const response1 = createEntitiesResponse('agent', [
      {_id: '3', name: 'Agent3'},
      {_id: '4', name: 'Agent4'},
    ]);
    const response2 = createActionResultResponse();
    const fakeHttp = createHttpMany([response1, response2]);
    const cmd = new AgentsCommand(fakeHttp);
    const result = await cmd.revokeByFilter(
      Filter.fromString("name='AgentToRevoke'"),
    );
    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'get', {
      args: {
        cmd: 'get_agents',
        filter: "name='AgentToRevoke'",
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'modify_agent',
        authorized: NO_VALUE,
        'agent_ids:': ['3', '4'],
      },
    });
    expect(result).toBeUndefined();
  });
});
