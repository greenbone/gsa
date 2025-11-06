/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentGroupsCommand from 'gmp/commands/agent-groups';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import AgentGroup from 'gmp/models/agent-group';

describe('AgentGroupsCommand tests', () => {
  test('should fetch agent groups with default params', async () => {
    const response = createEntitiesResponse('agent_group', [
      {_id: '1', name: 'Group1'},
      {_id: '2', name: 'Group2'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new AgentGroupsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_groups'},
    });
    expect(result.data).toEqual([
      new AgentGroup({id: '1', name: 'Group1'}),
      new AgentGroup({id: '2', name: 'Group2'}),
    ]);
  });

  test('should fetch agent groups with custom params', async () => {
    const response = createEntitiesResponse('agent_group', [
      {_id: '3', name: 'Group3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentGroupsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Group3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_groups',
        filter: "name='Group3'",
      },
    });
    expect(result.data).toEqual([new AgentGroup({id: '3', name: 'Group3'})]);
  });

  test('should fetch all agent groups', async () => {
    const response = createEntitiesResponse('agent_group', [
      {_id: '4', name: 'Group4'},
      {_id: '5', name: 'Group5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentGroupsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_groups', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new AgentGroup({id: '4', name: 'Group4'}),
      new AgentGroup({id: '5', name: 'Group5'}),
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

    const cmd = new AgentGroupsCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'agent_group',
        group_column: 'severity',
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

    const cmd = new AgentGroupsCommand(fakeHttp);
    const result = await cmd.getNetworkAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'agent_group',
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
});
