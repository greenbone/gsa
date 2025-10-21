/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentInstallersCommand from 'gmp/commands/agentinstallers';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import AgentInstaller from 'gmp/models/agentinstaller';

describe('AgentInstallers tests', () => {
  test('should fetch agent installers with default params', async () => {
    const response = createEntitiesResponse('agent_installer', [
      {_id: '1', name: 'Installer1'},
      {_id: '2', name: 'Installer2'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallersCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_installers'},
    });
    expect(result.data).toEqual([
      new AgentInstaller({id: '1', name: 'Installer1'}),
      new AgentInstaller({id: '2', name: 'Installer2'}),
    ]);
  });

  test('should fetch agent installers with custom params', async () => {
    const response = createEntitiesResponse('agent_installer', [
      {_id: '3', name: 'Installer3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentInstallersCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Installer3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_installers', filter: "name='Installer3'"},
    });
    expect(result.data).toEqual([
      new AgentInstaller({id: '3', name: 'Installer3'}),
    ]);
  });

  test('should fetch all agent installers', async () => {
    const response = createEntitiesResponse('agent_installer', [
      {_id: '4', name: 'Installer4'},
      {_id: '5', name: 'Installer5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AgentInstallersCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_installers', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new AgentInstaller({id: '4', name: 'Installer4'}),
      new AgentInstaller({id: '5', name: 'Installer5'}),
    ]);
  });
});
