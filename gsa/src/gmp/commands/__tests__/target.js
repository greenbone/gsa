/* Copyright (C) 2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {TargetCommand} from '../targets';

import {createActionResultResponse, createHttp} from '../testing';

describe('TagCommand tests', () => {
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
        target_source: 'manual',
        target_exclude_source: 'manual',
        hosts_filter: undefined,
        in_use: false,
        hosts: '123.456, 678.9',
        exclude_hosts: '',
        reverse_lookup_only: '0',
        reverse_lookup_unify: '1',
        port_list_id: 'pl_id1',
        alive_tests: 'Scan Config Default',
        port: 22,
        ssh_credential_id: 'ssh_id',
        ssh_elevate_credential_id: '0',
        smb_credential_id: '0',
        esxi_credential_id: '0',
        snmp_credential_id: '0',
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
        target_source: 'manual',
        target_exclude_source: 'manual',
        hosts_filter: undefined,
        in_use: false,
        hosts: '123.456, 678.9',
        exclude_hosts: '',
        reverse_lookup_only: '0',
        reverse_lookup_unify: '1',
        port_list_id: 'pl_id1',
        alive_tests: 'Scan Config Default',
        port: 22,
        ssh_credential_id: '0',
        ssh_elevate_credential_id: 'ssh_elevate_id',
        smb_credential_id: '0',
        esxi_credential_id: '0',
        snmp_credential_id: '0',
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
        target_source: 'manual',
        target_exclude_source: 'manual',
        hosts_filter: undefined,
        exclude_file: undefined,
        in_use: false,
        hosts: '123.456, 678.9',
        exclude_hosts: '',
        reverse_lookup_only: '0',
        reverse_lookup_unify: '1',
        port_list_id: 'pl_id1',
        alive_tests: 'Scan Config Default',
        port: 22,
        ssh_credential_id: 'ssh_id',
        ssh_elevate_credential_id: '0',
        smb_credential_id: '0',
        esxi_credential_id: '0',
        snmp_credential_id: '0',
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
        target_source: 'manual',
        target_exclude_source: 'manual',
        hosts_filter: undefined,
        exclude_file: undefined,
        in_use: false,
        hosts: '123.456, 678.9',
        exclude_hosts: '',
        reverse_lookup_only: '0',
        reverse_lookup_unify: '1',
        port_list_id: 'pl_id1',
        alive_tests: 'Scan Config Default',
        port: 22,
        ssh_credential_id: '0',
        ssh_elevate_credential_id: 'ssh_elevate_id',
        smb_credential_id: '0',
        esxi_credential_id: '0',
        snmp_credential_id: '0',
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
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });
});
