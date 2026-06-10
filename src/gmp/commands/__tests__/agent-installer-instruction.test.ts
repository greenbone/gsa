/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentInstallerInstructionsCommand from 'gmp/commands/agent-installer-instruction';
import {createResponse, createHttp} from 'gmp/commands/testing';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

const makeMockInstructions = (
  overrides: Partial<InstallInstructionsData> = {},
): InstallInstructionsData => ({
  _version: '1.0',
  lang: 'en',
  title: 'Agent Installation',
  sections: [
    {
      id: 'heading-1',
      type: 'heading',
      level: 2,
      text: 'Quick Install',
    },
  ],
  ...overrides,
});

const makeResponse = (instructions: InstallInstructionsData) =>
  createResponse({
    get_agent_installer_instruction: {
      get_agent_installer_instruction_response: {
        instruction: JSON.stringify(instructions),
      },
    },
  });

describe('AgentInstallerInstructionsCommand tests', () => {
  test('should call get with only cmd when no params are given', async () => {
    const instructions = makeMockInstructions();
    const response = makeResponse(instructions);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallerInstructionsCommand(fakeHttp);

    await cmd.getInstructions({});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_installer_instruction',
      },
    });
  });

  test('should include language_type when lang is given', async () => {
    const instructions = makeMockInstructions();
    const response = makeResponse(instructions);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallerInstructionsCommand(fakeHttp);

    await cmd.getInstructions({lang: 'en'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_installer_instruction',
        language_type: 'en',
      },
    });
  });

  test('should include scanner_id when scannerId is given', async () => {
    const instructions = makeMockInstructions();
    const response = makeResponse(instructions);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallerInstructionsCommand(fakeHttp);

    await cmd.getInstructions({scannerId: 'scanner-1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_installer_instruction',
        scanner_id: 'scanner-1',
      },
    });
  });

  test('should include both language_type and scanner_id when both are given', async () => {
    const instructions = makeMockInstructions();
    const response = makeResponse(instructions);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallerInstructionsCommand(fakeHttp);

    await cmd.getInstructions({lang: 'de', scannerId: 'scanner-42'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_agent_installer_instruction',
        language_type: 'de',
        scanner_id: 'scanner-42',
      },
    });
  });

  test('should parse the nested JSON instruction and return it as response data', async () => {
    const instructions = makeMockInstructions({
      title: 'Parsed Title',
      sections: [
        {
          id: 'para-1',
          type: 'paragraph',
          text: 'Hello world',
        },
      ],
    });
    const response = makeResponse(instructions);
    const fakeHttp = createHttp(response);
    const cmd = new AgentInstallerInstructionsCommand(fakeHttp);

    const result = await cmd.getInstructions({});

    expect(result.data.title).toEqual('Parsed Title');
    expect(result.data.sections).toHaveLength(1);
    expect(result.data.sections[0]).toMatchObject({
      id: 'para-1',
      type: 'paragraph',
      text: 'Hello world',
    });
  });
});
