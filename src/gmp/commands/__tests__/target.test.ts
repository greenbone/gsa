/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import TargetCommand from 'gmp/commands/target';
import {
  createActionResultResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import type Http from 'gmp/http/http';
import {ResponseRejection} from 'gmp/http/rejection';
import {SCAN_CONFIG_DEFAULT} from 'gmp/models/target';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {UNSET_VALUE} from 'web/utils/Render';

describe('TargetCommand tests', () => {
  test('should create target', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.create({
      allowSimultaneousIPs: true,
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: NO_VALUE,
      reverseLookupUnify: YES_VALUE,
      portListId: 'pl_id1',
      aliveTests: [SCAN_CONFIG_DEFAULT],
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
        allow_simultaneous_ips: 1,
        'alive_tests:': ['Scan Config Default'],
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
        reverse_lookup_unify: YES_VALUE,
        reverse_lookup_only: NO_VALUE,
        smb_credential_id: '0',
        snmp_credential_id: '0',
        ssh_credential_id: 'ssh_id',
        ssh_elevate_credential_id: '0',
        target_exclude_source: 'manual',
        target_source: 'manual',
        krb5_credential_id: '0',
      },
    });
    expect(resp.data.id).toEqual('foo');
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
      } as XMLHttpRequest;
      const rejection = new ResponseRejection(xhr, message);
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
      } as unknown as Http;

      const cmd = new TargetCommand(fakeHttp);
      await expect(
        cmd.create({
          allowSimultaneousIPs: true,
          name: 'name',
          comment: 'comment',
          targetSource: 'manual',
          targetExcludeSource: 'manual',
          hostsFilter: undefined,
          hosts: '123.456, 678.9',
          excludeHosts: '',
          reverseLookupOnly: NO_VALUE,
          reverseLookupUnify: YES_VALUE,
          portListId: 'pl_id1',
          aliveTests: [SCAN_CONFIG_DEFAULT],
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
    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.create({
      allowSimultaneousIPs: true,
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: NO_VALUE,
      reverseLookupUnify: YES_VALUE,
      portListId: 'pl_id1',
      aliveTests: [SCAN_CONFIG_DEFAULT],
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
        allow_simultaneous_ips: YES_VALUE,
        'alive_tests:': ['Scan Config Default'],
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
        reverse_lookup_unify: YES_VALUE,
        reverse_lookup_only: NO_VALUE,
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
    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'target_id1',
      allowSimultaneousIPs: true,
      name: 'name',
      comment: 'comment',
      targetSource: 'manual',
      targetExcludeSource: 'manual',
      hostsFilter: undefined,
      excludeFile: undefined,
      hosts: '123.456, 678.9',
      excludeHosts: '',
      reverseLookupOnly: NO_VALUE,
      reverseLookupUnify: YES_VALUE,
      portListId: 'pl_id1',
      aliveTests: [SCAN_CONFIG_DEFAULT],
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
        allow_simultaneous_ips: YES_VALUE,
        'alive_tests:': ['Scan Config Default'],
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
        reverse_lookup_unify: YES_VALUE,
        reverse_lookup_only: NO_VALUE,
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
      } as XMLHttpRequest;
      const rejection = new ResponseRejection(xhr, message);
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
      } as unknown as Http;

      const cmd = new TargetCommand(fakeHttp);
      await expect(
        cmd.save({
          id: 'target_id1',
          allowSimultaneousIPs: true,
          name: 'name',
          comment: 'comment',
          targetSource: 'manual',
          targetExcludeSource: 'manual',
          hostsFilter: undefined,
          excludeFile: undefined,
          hosts: '123.456, 678.9',
          excludeHosts: '',
          reverseLookupOnly: NO_VALUE,
          reverseLookupUnify: YES_VALUE,
          portListId: 'pl_id1',
          aliveTests: [SCAN_CONFIG_DEFAULT],
          port: 22,
          sshCredentialId: UNSET_VALUE,
          sshElevateCredentialId: 'ssh_elevate_id',
          smbCredentialId: UNSET_VALUE,
          esxiCredentialId: UNSET_VALUE,
          snmpCredentialId: UNSET_VALUE,
          krb5CredentialId: UNSET_VALUE,
        }),
      ).rejects.toThrow(expectedMessage);
    },
  );

  test('should nullify ssh_elevate_credential if ssh_credential is not set in save command', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TargetCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'target_id1',
      name: 'name',
      sshCredentialId: undefined,
      sshElevateCredentialId: 'ssh_elevate_id',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_target',
        allow_simultaneous_ips: undefined,
        'alive_tests:': undefined,
        comment: undefined,
        esxi_credential_id: undefined,
        exclude_file: undefined,
        exclude_hosts: undefined,
        file: undefined,
        hosts: undefined,
        name: 'name',
        port: undefined,
        port_list_id: undefined,
        reverse_lookup_unify: undefined,
        reverse_lookup_only: undefined,
        smb_credential_id: undefined,
        snmp_credential_id: undefined,
        ssh_credential_id: undefined,
        ssh_elevate_credential_id: undefined,
        target_exclude_source: undefined,
        target_id: 'target_id1',
        target_source: undefined,
        krb5_credential_id: undefined,
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
