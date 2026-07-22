/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentInstaller from 'gmp/models/agent-installer';
import {testModel} from 'gmp/models/testing';

describe('AgentInstaller model tests', () => {
  testModel(AgentInstaller, 'agentinstaller');

  test('should use defaults', () => {
    const agentInstaller = new AgentInstaller({id: '123'});

    expect(agentInstaller.id).toEqual('123');
    expect(agentInstaller.name).toBeUndefined();
    expect(agentInstaller.comment).toBeUndefined();
    expect(agentInstaller.description).toBeUndefined();
    expect(agentInstaller.entityType).toEqual('agentinstaller');
    expect(agentInstaller.contentType).toBeUndefined();
    expect(agentInstaller.fileExtension).toBeUndefined();
    expect(agentInstaller.version).toBeUndefined();
    expect(agentInstaller.checksum).toBeUndefined();
  });

  test('should parse contentType', () => {
    const agentInstaller = AgentInstaller.fromElement({
      _id: '123',
      content_type: 'application/octet-stream',
    });

    expect(agentInstaller.contentType).toBe('application/octet-stream');
  });

  test('should parse description', () => {
    const agentInstaller = AgentInstaller.fromElement({
      _id: '123',
      description: 'This is a test agent installer.',
    });

    expect(agentInstaller.description).toBe('This is a test agent installer.');
  });

  test('should parse fileExtension', () => {
    const agentInstaller = AgentInstaller.fromElement({
      _id: '123',
      file_extension: '.exe',
    });

    expect(agentInstaller.fileExtension).toBe('.exe');
  });

  test('should parse version', () => {
    const agentInstaller = AgentInstaller.fromElement({
      _id: '123',
      version: '1.0.0',
    });

    expect(agentInstaller.version).toBe('1.0.0');
  });

  test('should parse checksum', () => {
    const agentInstaller = AgentInstaller.fromElement({
      _id: '123',
      checksum: 'abc123',
    });

    expect(agentInstaller.checksum).toBe('abc123');
  });
});
