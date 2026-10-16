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
      comment: 'Test agent',
      intervalInSeconds: 3600,
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent',
        'agent_ids:': ['324'],
        authorized: YES_VALUE,
        update_to_latest: YES_VALUE,
        comment: 'Test agent',
        interval_in_seconds: 3600,
      },
    });
    expect(result).toBeUndefined();
  });

  test('should not include update_to_latest if not provided', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentCommand(http);

    await command.save({
      agentsIds: ['324'],
      authorized: true,
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent',
        'agent_ids:': ['324'],
        authorized: YES_VALUE,
      },
    });
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

  test('should allow to download agent support bundle', async () => {
    const fakeFile = new ArrayBuffer(8);
    const http = createHttp(fakeFile);
    const command = new AgentCommand(http);

    const result = await command.downloadSupportBundle({id: '324'});

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_support_bundle',
        agent_uuid: '324',
        encryption: 1,
        anonymized: 0,
      },
      responseType: 'arraybuffer',
    });
    expect(result).toBe(fakeFile);
  });

  test.each([
    {
      encryption: true,
      anonymized: false,
      expectedEncryption: 1,
      expectedAnonymized: 0,
    },
    {
      encryption: false,
      anonymized: false,
      expectedEncryption: 0,
      expectedAnonymized: 0,
    },
    {
      encryption: true,
      anonymized: true,
      expectedEncryption: 1,
      expectedAnonymized: 1,
    },
    {
      encryption: false,
      anonymized: true,
      expectedEncryption: 0,
      expectedAnonymized: 1,
    },
  ])(
    'should download a support bundle with encryption=$encryption and anonymized=$anonymized',
    async ({
      encryption,
      anonymized,
      expectedEncryption,
      expectedAnonymized,
    }) => {
      const fakeFile = new ArrayBuffer(8);
      const http = createHttp(fakeFile);
      const command = new AgentCommand(http);

      const result = await command.downloadSupportBundle({
        id: '324',
        encryption,
        anonymized,
      });

      expect(http.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_agent_support_bundle',
          agent_uuid: '324',
          encryption: expectedEncryption,
          anonymized: expectedAnonymized,
        },
        responseType: 'arraybuffer',
      });
      expect(result).toBe(fakeFile);
    },
  );
});
