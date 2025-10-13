/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentInstaller from 'gmp/models/agentinstaller';
import date from 'gmp/models/date';
import {testModel} from 'gmp/models/testing';

testModel(AgentInstaller, 'agentinstaller');

describe('AgentInstaller model tests', () => {
  test('should use defaults', () => {
    const agentInstaller = new AgentInstaller();

    expect(agentInstaller.id).toBeUndefined();
    expect(agentInstaller.name).toBeUndefined();
    expect(agentInstaller.comment).toBeUndefined();
    expect(agentInstaller.entityType).toEqual('agentinstaller');
    expect(agentInstaller.contentType).toBeUndefined();
    expect(agentInstaller.fileExtension).toBeUndefined();
    expect(agentInstaller.version).toBeUndefined();
    expect(agentInstaller.checksum).toBeUndefined();
    expect(agentInstaller.fileSize).toBeUndefined();
    expect(agentInstaller.fileValidity).toBeUndefined();
    expect(agentInstaller.lastUpdate).toBeUndefined();
    expect(agentInstaller.cpes).toEqual([]);
  });

  test('should parse contentType', () => {
    const agentInstaller = AgentInstaller.fromElement({
      content_type: 'application/octet-stream',
    });

    expect(agentInstaller.contentType).toBe('application/octet-stream');
  });

  test('should parse fileExtension', () => {
    const agentInstaller = AgentInstaller.fromElement({
      file_extension: '.exe',
    });

    expect(agentInstaller.fileExtension).toBe('.exe');
  });

  test('should parse version', () => {
    const agentInstaller = AgentInstaller.fromElement({
      version: '1.0.0',
    });

    expect(agentInstaller.version).toBe('1.0.0');
  });

  test('should parse checksum', () => {
    const agentInstaller = AgentInstaller.fromElement({
      checksum: 'abc123',
    });

    expect(agentInstaller.checksum).toBe('abc123');
  });

  test('should parse fileSize', () => {
    const agentInstaller = AgentInstaller.fromElement({
      file_size: 2048,
    });

    expect(agentInstaller.fileSize).toBe(2048);
  });

  test('should parse fileValidity', () => {
    const agentInstallerValid = AgentInstaller.fromElement({
      file_validity: 'valid',
    });
    expect(agentInstallerValid.fileValidity).toBe('valid');

    const agentInstallerInvalid = AgentInstaller.fromElement({
      file_validity: 'invalid',
    });
    expect(agentInstallerInvalid.fileValidity).toBe('invalid');

    const agentInstallerUnknown = AgentInstaller.fromElement({
      file_validity: 'unknown',
    });
    expect(agentInstallerUnknown.fileValidity).toBe('unknown');

    const agentInstallerUndefined = AgentInstaller.fromElement({});
    expect(agentInstallerUndefined.fileValidity).toBeUndefined();
  });

  test('should parse lastUpdate', () => {
    const agentInstaller = AgentInstaller.fromElement({
      last_update: '2023-10-01T12:34:56Z',
    });

    expect(agentInstaller.lastUpdate).toEqual(date('2023-10-01T12:34:56Z'));
  });

  test('should parse cpes', () => {
    const agentInstaller = AgentInstaller.fromElement({
      cpes: [
        {
          criteria: 'cpe:/a:vendor:product:1.0',
          version_start_incl: '1.0',
          version_end_excl: '2.0',
        },
        {
          criteria: 'cpe:/a:vendor:product:2.0',
          version_start_excl: '2.0',
          version_end_incl: '3.0',
        },
      ],
    });

    expect(agentInstaller.cpes).toEqual([
      {
        criteria: 'cpe:/a:vendor:product:1.0',
        versionStartIncluding: '1.0',
        versionStartExcluding: undefined,
        versionEndIncluding: undefined,
        versionEndExcluding: '2.0',
      },
      {
        criteria: 'cpe:/a:vendor:product:2.0',
        versionStartIncluding: undefined,
        versionStartExcluding: '2.0',
        versionEndIncluding: '3.0',
        versionEndExcluding: undefined,
      },
    ]);

    const agentInstaller2 = AgentInstaller.fromElement({
      cpes: {
        criteria: 'cpe:/a:vendor:product:1.0',
        version_start_incl: '1.0',
        version_end_excl: '2.0',
      },
    });

    expect(agentInstaller2.cpes).toEqual([
      {
        criteria: 'cpe:/a:vendor:product:1.0',
        versionStartIncluding: '1.0',
        versionStartExcluding: undefined,
        versionEndIncluding: undefined,
        versionEndExcluding: '2.0',
      },
    ]);
  });
});
