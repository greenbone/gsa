/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentCommand from 'gmp/commands/agent';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {type Element} from 'gmp/models/model';
import {YES_VALUE} from 'gmp/parser';

const createAgentResponse = (data: Element) =>
  createEntityResponse('agent', data);

describe('AgentCommand tests', () => {
  test('should allow to get an agent', async () => {
    const entityResponse = createAgentResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentCommand(http);
    const result = await command.get({id: '324'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent', agent_id: '324'},
    });
    expect(result.data.id).toEqual('324');
  });

  test('should allow to delete an agent', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new AgentCommand(http);
    await command.delete({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'delete_agent', 'agent_ids:': '324'},
    });
  });

  test('should allow to save an agent', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentCommand(http);
    const result = await command.save({
      agentsIds: ['324'],
      authorized: true,
      updateToLatest: true,
      attempts: 5,
      comment: 'Test agent',
      delayInSeconds: 10,
      maxJitterInSeconds: 3,
      bulkSize: 50,
      bulkThrottleTime: 2,
      indexerDirDepth: 4,
      schedulerCronTimes: ['0 0 * * *', '30 14 * * 1-5'],
      intervalInSeconds: 3600,
      missUntilInactive: 3,
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent',
        'agent_ids:': ['324'],
        authorized: YES_VALUE,
        update_to_latest: YES_VALUE,
        comment: 'Test agent',
        attempts: 5,
        delay_in_seconds: 10,
        max_jitter_in_seconds: 3,
        bulk_size: 50,
        bulk_throttle_time_in_ms: 2,
        indexer_dir_depth: 4,
        interval_in_seconds: 3600,
        miss_until_inactive: 3,
        'scheduler_cron_times:': ['0 0 * * *', '30 14 * * 1-5'],
      },
    });
    expect(result).toBeUndefined();
  });

  test('should allow to clone an agent', async () => {
    const entityResponse = createActionResultResponse({id: '999'});
    const http = createHttp(entityResponse);
    const command = new AgentCommand(http);
    const result = await command.clone({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        resource_type: 'agent',
        id: '324',
      },
    });
    expect(result.data.id).toEqual('999');
  });

  test('should allow to export an agent', async () => {
    const fakeFile = new ArrayBuffer(8);
    const http = createHttp(fakeFile);
    const command = new AgentCommand(http);
    const result = await command.export({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'agent',
        bulk_select: 1,
        ['bulk_selected:324']: 1,
      },
    });
    expect(result).toBe(fakeFile);
  });
});
