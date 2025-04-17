/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {TargetCommand} from 'gmp/commands/targets';
import {
  createActionResultResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import Rejection from 'gmp/http/rejection';

describe('TargetCommand tests', () => {
  test('should create target', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.create({
      allowSimultaneousIPs: '1',
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      inUse: false,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: '0',
      reverseLookupUnify: '1',
      portListId: 'pl_id1',
      aliveTests: 'Scan Config Default',
      port: 22,
      sshCredentialId: 'ssh_id',
      sshElevateCredentialId: '0',
      smbCredentialId: '0',
      esxiCredentialId: '0',
      snmpCredentialId: '0',
      krb5CredentialId: '0',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_target',
        allow_simultaneous_ips: '1',
        alive_tests: 'Scan Config Default',
        comment: 'comment',
        esxi_credential_id: '0',
        exclude_file: undefined,
        exclude_hosts: '',
        file: undefined,
        hosts: '123.456, 678.9',
        hosts_filter: undefined,
        name: 'name',
        port: 22,
        port_list_id: 'pl_id1',
        reverse_lookup_unify: '1',
        reverse_lookup_only: '0',
        smb_credential_id: '0',
        snmp_credential_id: '0',
        ssh_credential_id: 'ssh_id',
        ssh_elevate_credential_id: '0',
        target_exclude_source: 'manual',
        target_source: 'manual',
        krb5_credential_id: '0',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test.each([
    {
      name: 'resource restricted',
      feedsResponse: {feed_owner_set: 1},
      message: 'Some Error',
      expectedMessage:
        'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'feed owner not set',
      feedsResponse: {feed_owner_set: 0},
      message: 'Some Error',
      expectedMessage:
        'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing port list',
      message: 'Failed to find port_list XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Target because the default Port List is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing scan config',
      message: 'Failed to find config XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Task because the default Scan Config is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
  ])(
    'should not create new target while feed is not available: $name',
    async ({feedsResponse, message, expectedMessage}) => {
      const xhr = {
        status: 404,
      };
      const rejection = new Rejection(xhr, Rejection.REASON_ERROR, message);
      const feedStatusResponse = createResponse({
        get_feeds: {
          get_feeds_response: feedsResponse,
        },
      });
      const fakeHttp = {
        request: testing
          .fn()
          .mockRejectedValueOnce(rejection)
          .mockResolvedValueOnce(feedStatusResponse),
      };

      const cmd = new TargetCommand(fakeHttp);
      await expect(
        cmd.create({
          allowSimultaneousIPs: '1',
          name: 'name',
          comment: 'comment',
          targetSource: 'manual',
          targetExcludeSource: 'manual',
          hostsFilter: undefined,
          inUse: false,
          hosts: '123.456, 678.9',
          excludeHosts: '',
          reverseLookupOnly: '0',
          reverseLookupUnify: '1',
          portListId: 'pl_id1',
          aliveTests: 'Scan Config Default',
          port: 22,
          sshCredentialId: 'ssh_id',
          sshElevateCredentialId: '0',
          smbCredentialId: '0',
          esxiCredentialId: '0',
          snmpCredentialId: '0',
          krb5CredentialId: '0',
        }),
      ).rejects.toThrow(expectedMessage);
    },
  );

  test('should nullify ssh_elevate_credential in create command', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.create({
      allowSimultaneousIPs: '1',
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      inUse: false,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: '0',
      reverseLookupUnify: '1',
      portListId: 'pl_id1',
      aliveTests: 'Scan Config Default',
      port: 22,
      sshCredentialId: '0',
      sshElevateCredentialId: 'ssh_elevate_id',
      smbCredentialId: '0',
      esxiCredentialId: '0',
      snmpCredentialId: '0',
      krb5CredentialId: '0',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_target',
        allow_simultaneous_ips: '1',
        alive_tests: 'Scan Config Default',
        comment: 'comment',
        esxi_credential_id: '0',
        exclude_file: undefined,
        exclude_hosts: '',
        file: undefined,
        hosts: '123.456, 678.9',
        hosts_filter: undefined,
        name: 'name',
        port: 22,
        port_list_id: 'pl_id1',
        reverse_lookup_unify: '1',
        reverse_lookup_only: '0',
        smb_credential_id: '0',
        snmp_credential_id: '0',
        ssh_credential_id: '0',
        ssh_elevate_credential_id: '0',
        target_exclude_source: 'manual',
        target_source: 'manual',
        krb5_credential_id: '0',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save target', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'target_id1',
      allowSimultaneousIPs: '1',
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      excludeFile: undefined,
      inUse: false,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: '0',
      reverseLookupUnify: '1',
      portListId: 'pl_id1',
      aliveTests: 'Scan Config Default',
      port: 22,
      sshCredentialId: 'ssh_id',
      sshElevateCredentialId: '0',
      smbCredentialId: '0',
      esxiCredentialId: '0',
      snmpCredentialId: '0',
      krb5CredentialId: '0',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_target',
        allow_simultaneous_ips: '1',
        alive_tests: 'Scan Config Default',
        comment: 'comment',
        esxi_credential_id: '0',
        exclude_file: undefined,
        exclude_hosts: '',
        file: undefined,
        hosts: '123.456, 678.9',
        hosts_filter: undefined,
        in_use: '0',
        name: 'name',
        port: 22,
        port_list_id: 'pl_id1',
        reverse_lookup_unify: '1',
        reverse_lookup_only: '0',
        smb_credential_id: '0',
        snmp_credential_id: '0',
        ssh_credential_id: 'ssh_id',
        ssh_elevate_credential_id: '0',
        krb5_credential_id: '0',
        target_exclude_source: 'manual',
        target_id: 'target_id1',
        target_source: 'manual',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test.each([
    {
      name: 'resource restricted',
      feedsResponse: {feed_owner_set: 1},
      message: 'Some Error',
      expectedMessage:
        'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'feed owner not set',
      feedsResponse: {feed_owner_set: 0},
      message: 'Some Error',
      expectedMessage:
        'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing port list',
      message: 'Failed to find port_list XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Target because the default Port List is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing scan config',
      message: 'Failed to find config XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Task because the default Scan Config is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
  ])(
    'should not save target while feed is not available: $name',
    async ({feedsResponse, message, expectedMessage}) => {
      const xhr = {
        status: 404,
      };
      const rejection = new Rejection(xhr, Rejection.REASON_ERROR, message);
      const feedStatusResponse = createResponse({
        get_feeds: {
          get_feeds_response: feedsResponse,
        },
      });
      const fakeHttp = {
        request: testing
          .fn()
          .mockRejectedValueOnce(rejection)
          .mockResolvedValueOnce(feedStatusResponse),
      };

      const cmd = new TargetCommand(fakeHttp);
      await expect(
        cmd.save({
          id: 'target_id1',
          allowSimultaneousIPs: '1',
          name: 'name',
          comment: 'comment',
          targetSource: 'manual',
          targetExcludeSource: 'manual',
          hostsFilter: undefined,
          excludeFile: undefined,
          inUse: false,
          hosts: '123.456, 678.9',
          excludeHosts: '',
          reverseLookupOnly: '0',
          reverseLookupUnify: '1',
          portListId: 'pl_id1',
          aliveTests: 'Scan Config Default',
          port: 22,
          sshCredentialId: '0',
          sshElevateCredentialId: 'ssh_elevate_id',
          smbCredentialId: '0',
          esxiCredentialId: '0',
          snmpCredentialId: '0',
          krb5CredentialId: '0',
        }),
      ).rejects.toThrow(expectedMessage);
    },
  );

  test('should nullify ssh_elevate_credential in save command', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'target_id1',
      allowSimultaneousIPs: '1',
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      excludeFile: undefined,
      inUse: false,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: '0',
      reverseLookupUnify: '1',
      portListId: 'pl_id1',
      aliveTests: 'Scan Config Default',
      port: 22,
      sshCredentialId: '0',
      sshElevateCredentialId: 'ssh_elevate_id',
      smbCredentialId: '0',
      esxiCredentialId: '0',
      snmpCredentialId: '0',
      krb5CredentialId: '0',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_target',
        allow_simultaneous_ips: '1',
        alive_tests: 'Scan Config Default',
        comment: 'comment',
        esxi_credential_id: '0',
        exclude_file: undefined,
        exclude_hosts: '',
        file: undefined,
        hosts: '123.456, 678.9',
        hosts_filter: undefined,
        in_use: '0',
        name: 'name',
        port: 22,
        port_list_id: 'pl_id1',
        reverse_lookup_unify: '1',
        reverse_lookup_only: '0',
        smb_credential_id: '0',
        snmp_credential_id: '0',
        ssh_credential_id: '0',
        ssh_elevate_credential_id: '0',
        target_exclude_source: 'manual',
        target_id: 'target_id1',
        target_source: 'manual',
        krb5_credential_id: '0',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
