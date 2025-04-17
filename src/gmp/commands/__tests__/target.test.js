/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {TargetCommand} from 'gmp/commands/targets';
import {createActionResultResponse, createHttp} from 'gmp/commands/testing';

describe('TargetCommand tests', () => {
  test('should create target', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    return cmd
      .create({
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
      })
      .then(resp => {
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
  });

  test('should nullify ssh_elevate_credential in create command', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    return cmd
      .create({
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
      })
      .then(resp => {
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
  });

  test('should save target', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    return cmd
      .save({
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
      })
      .then(resp => {
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
  });
  test('should nullify ssh_elevate_credential in save command', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TargetCommand(fakeHttp);
    return cmd
      .save({
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
      })
      .then(resp => {
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
});
