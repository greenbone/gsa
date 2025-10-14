/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentInstallerCommand from 'gmp/commands/agentinstaller';
import {createEntityResponse, createHttp} from 'gmp/commands/testing';
import DefaultTransform from 'gmp/http/transform/default';

describe('AgentInstallerCommand tests', () => {
  test('should allow to get an agent installer', async () => {
    const entityResponse = createEntityResponse('agent_installer', {id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentInstallerCommand(http);
    const result = await command.get({id: '324'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_installer', agent_installer_id: '324'},
    });
    expect(result.data.id).toEqual('324');
  });

  test("should allow to delete an agent installer's", async () => {
    const entityResponse = createEntityResponse('agent_installer', {id: '324'});
    const http = createHttp(entityResponse);
    const command = new AgentInstallerCommand(http);
    await command.delete({id: '324'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'delete_agent_installer', agent_installer_id: '324'},
    });
  });

  test("should allow to download an agent installer's file", async () => {
    const fakeFile = new ArrayBuffer(8);
    const http = createHttp(fakeFile);
    const command = new AgentInstallerCommand(http);
    const result = await command.download('324');
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_installer_file', agent_installer_id: '324'},
      responseType: 'arraybuffer',
      transform: DefaultTransform,
    });
    expect(result).toBe(fakeFile);
  });
});
