/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import PortList from 'gmp/models/port-list';
import Target, {ARP_PING, ICMP_PING} from 'gmp/models/target';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE} from 'gmp/parser';

testModel(Target, 'target');

describe('Target model tests', () => {
  test('should use defaults', () => {
    const target = new Target();

    expect(target.alive_tests).toEqual([]);
    expect(target.allowSimultaneousIPs).toEqual(false);
    expect(target.esxi_credential).toBeUndefined();
    expect(target.exclude_hosts).toEqual([]);
    expect(target.hosts).toEqual([]);
    expect(target.krb5_credential).toBeUndefined();
    expect(target.max_hosts).toEqual(0);
    expect(target.port_list).toBeUndefined();
    expect(target.reverse_lookup_only).toEqual(NO_VALUE);
    expect(target.reverse_lookup_unify).toEqual(NO_VALUE);
    expect(target.smb_credential).toBeUndefined();
    expect(target.snmp_credential).toBeUndefined();
    expect(target.ssh_credential).toBeUndefined();
    expect(target.ssh_elevate_credential).toBeUndefined();
    expect(target.tasks).toEqual([]);
  });

  test('should parse defaults', () => {
    const target = Target.fromElement({});

    expect(target.alive_tests).toEqual([]);
    expect(target.allowSimultaneousIPs).toEqual(false);
    expect(target.esxi_credential).toBeUndefined();
    expect(target.exclude_hosts).toEqual([]);
    expect(target.hosts).toEqual([]);
    expect(target.krb5_credential).toBeUndefined();
    expect(target.max_hosts).toEqual(0);
    expect(target.port_list).toBeUndefined();
    expect(target.reverse_lookup_only).toEqual(NO_VALUE);
    expect(target.reverse_lookup_unify).toEqual(NO_VALUE);
    expect(target.smb_credential).toBeUndefined();
    expect(target.snmp_credential).toBeUndefined();
    expect(target.ssh_credential).toBeUndefined();
    expect(target.ssh_elevate_credential).toBeUndefined();
    expect(target.tasks).toEqual([]);
  });

  test('should parse port list', () => {
    const elem1 = {
      port_list: {
        _id: '123',
      },
    };
    const elem2 = {
      port_list: {
        _id: '',
      },
    };
    const target1 = Target.fromElement(elem1);
    const target2 = Target.fromElement(elem2);
    const target3 = Target.fromElement({});

    expect(target1.port_list).toBeInstanceOf(PortList);
    expect(target1.port_list?.entityType).toEqual('portlist');
    expect(target1.port_list?.id).toEqual('123');
    expect(target2.port_list).toBeUndefined();
    expect(target3.port_list).toBeUndefined();
  });

  test('should parse smb credentials', () => {
    const target1 = Target.fromElement({smb_credential: {_id: '123'}});
    const target2 = Target.fromElement({smb_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.smb_credential).toBeInstanceOf(Model);
    expect(target1.smb_credential?.entityType).toEqual('credential');
    expect(target1.smb_credential?.id).toEqual('123');
    expect(target2.smb_credential).toBeUndefined();
    expect(target3.smb_credential).toBeUndefined();
  });

  test('should parse snmp credentials', () => {
    const target1 = Target.fromElement({snmp_credential: {_id: '123'}});
    const target2 = Target.fromElement({snmp_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.snmp_credential).toBeInstanceOf(Model);
    expect(target1.snmp_credential?.entityType).toEqual('credential');
    expect(target1.snmp_credential?.id).toEqual('123');
    expect(target2.snmp_credential).toBeUndefined();
    expect(target3.snmp_credential).toBeUndefined();
  });

  test('should parse ssh credentials', () => {
    const target1 = Target.fromElement({ssh_credential: {_id: '123'}});
    const target2 = Target.fromElement({ssh_credential: {_id: ''}});
    const target3 = Target.fromElement({});
    const target4 = Target.fromElement({
      ssh_credential: {_id: '456', port: 2222},
    });

    expect(target1.ssh_credential).toBeInstanceOf(Model);
    expect(target1.ssh_credential?.entityType).toEqual('credential');
    expect(target1.ssh_credential?.id).toEqual('123');
    expect(target2.ssh_credential).toBeUndefined();
    expect(target3.ssh_credential).toBeUndefined();
    expect(target4.ssh_credential).toBeInstanceOf(Model);
    expect(target4.ssh_credential?.entityType).toEqual('credential');
    expect(target4.ssh_credential?.id).toEqual('456');
    expect(target4.ssh_credential?.port).toEqual(2222);
  });

  test('should parse ssh elevate credentials', () => {
    const target1 = Target.fromElement({ssh_elevate_credential: {_id: '123'}});
    const target2 = Target.fromElement({ssh_elevate_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.ssh_elevate_credential).toBeInstanceOf(Model);
    expect(target1.ssh_elevate_credential?.entityType).toEqual('credential');
    expect(target1.ssh_elevate_credential?.id).toEqual('123');
    expect(target2.ssh_elevate_credential).toBeUndefined();
    expect(target3.ssh_elevate_credential).toBeUndefined();
  });

  test('should parse esxi credentials', () => {
    const target1 = Target.fromElement({esxi_credential: {_id: '123'}});
    const target2 = Target.fromElement({esxi_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.esxi_credential).toBeInstanceOf(Model);
    expect(target1.esxi_credential?.entityType).toEqual('credential');
    expect(target1.esxi_credential?.id).toEqual('123');
    expect(target2.esxi_credential).toBeUndefined();
    expect(target3.esxi_credential).toBeUndefined();
  });

  test('should parse krb5 credentials', () => {
    const target1 = Target.fromElement({krb5_credential: {_id: '123'}});
    const target2 = Target.fromElement({krb5_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.krb5_credential).toBeInstanceOf(Model);
    expect(target1.krb5_credential?.entityType).toEqual('credential');
    expect(target1.krb5_credential?.id).toEqual('123');
    expect(target2.krb5_credential).toBeUndefined();
    expect(target3.krb5_credential).toBeUndefined();
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const target1 = Target.fromElement(elem);
    const target2 = Target.fromElement({hosts: ''});

    expect(target1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(target2.hosts).toEqual([]);
  });

  test('should parse exclude_hosts or return empty array', () => {
    const elem = {
      exclude_hosts: '123.456.789.42, 987.654.321.1',
    };
    const target1 = Target.fromElement(elem);
    const target2 = Target.fromElement({exclude_hosts: ''});

    expect(target1.exclude_hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(target2.exclude_hosts).toEqual([]);
  });

  test('should parse max_hosts', () => {
    const target = Target.fromElement({max_hosts: 42});

    expect(target.max_hosts).toEqual(42);
  });

  test('should parse allowSimultaneousIps', () => {
    const target = Target.fromElement({allow_simultaneous_ips: 1});
    const target2 = Target.fromElement({allow_simultaneous_ips: 0});

    expect(target.allowSimultaneousIPs).toEqual(true);
    expect(target2.allowSimultaneousIPs).toEqual(false);
  });

  test('should parse reverse_lookup_only', () => {
    const target = Target.fromElement({reverse_lookup_only: 0});

    expect(target.reverse_lookup_only).toEqual(0);
  });

  test('should parse reverse_lookup_unify', () => {
    const target = Target.fromElement({reverse_lookup_unify: 1});

    expect(target.reverse_lookup_unify).toEqual(1);
  });

  test('should parse tasks', () => {
    const target1 = Target.fromElement({
      tasks: {
        task: [
          {
            _id: '123',
          },
        ],
      },
    });
    const target2 = Target.fromElement({
      tasks: {
        task: {_id: '123'},
      },
    });

    const task1 = target1?.tasks?.[0];
    expect(task1).toBeDefined();
    expect(task1).toBeInstanceOf(Model);
    expect(task1?.entityType).toEqual('task');
    expect(task1?.id).toEqual('123');

    const task2 = target2?.tasks?.[0];
    expect(task2).toBeDefined();
    expect(task2).toBeInstanceOf(Model);
    expect(task2?.entityType).toEqual('task');
    expect(task2?.id).toEqual('123');
  });

  test('should parse alive_tests', () => {
    const target = Target.fromElement({alive_tests: {alive_test: ICMP_PING}});
    expect(target.alive_tests).toEqual([ICMP_PING]);

    const target1 = Target.fromElement({
      alive_tests: {alive_test: [ICMP_PING, ARP_PING]},
    });
    expect(target1.alive_tests).toEqual([ICMP_PING, ARP_PING]);

    const target2 = Target.fromElement({alive_tests: {}});
    expect(target2.alive_tests).toEqual([]);

    const target3 = Target.fromElement({alive_tests: {alive_test: []}});
    expect(target3.alive_tests).toEqual([]);
  });
});
