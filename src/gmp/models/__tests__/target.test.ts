/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import PortList from 'gmp/models/port-list';
import Target, {ARP_PING, ICMP_PING} from 'gmp/models/target';
import {testModel} from 'gmp/models/testing';

describe('Target model tests', () => {
  testModel(Target, 'target');

  test('should use defaults', () => {
    const target = new Target();

    expect(target.aliveTests).toEqual([]);
    expect(target.allowSimultaneousIPs).toEqual(false);
    expect(target.esxiCredential).toBeUndefined();
    expect(target.excludeHosts).toEqual([]);
    expect(target.hosts).toEqual([]);
    expect(target.krb5Credential).toBeUndefined();
    expect(target.maxHosts).toEqual(0);
    expect(target.portList).toBeUndefined();
    expect(target.reverseLookupOnly).toEqual(false);
    expect(target.reverseLookupUnify).toEqual(false);
    expect(target.smbCredential).toBeUndefined();
    expect(target.snmpCredential).toBeUndefined();
    expect(target.sshCredential).toBeUndefined();
    expect(target.sshElevateCredential).toBeUndefined();
    expect(target.tasks).toEqual([]);
  });

  test('should parse defaults', () => {
    const target = Target.fromElement({});

    expect(target.aliveTests).toEqual([]);
    expect(target.allowSimultaneousIPs).toEqual(false);
    expect(target.esxiCredential).toBeUndefined();
    expect(target.excludeHosts).toEqual([]);
    expect(target.hosts).toEqual([]);
    expect(target.krb5Credential).toBeUndefined();
    expect(target.maxHosts).toEqual(0);
    expect(target.portList).toBeUndefined();
    expect(target.reverseLookupOnly).toEqual(false);
    expect(target.reverseLookupUnify).toEqual(false);
    expect(target.smbCredential).toBeUndefined();
    expect(target.snmpCredential).toBeUndefined();
    expect(target.sshCredential).toBeUndefined();
    expect(target.sshElevateCredential).toBeUndefined();
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

    expect(target1.portList).toBeInstanceOf(PortList);
    expect(target1.portList?.entityType).toEqual('portlist');
    expect(target1.portList?.id).toEqual('123');
    expect(target2.portList).toBeUndefined();
    expect(target3.portList).toBeUndefined();
  });

  test('should parse smb credentials', () => {
    const target1 = Target.fromElement({smb_credential: {_id: '123'}});
    const target2 = Target.fromElement({smb_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.smbCredential).toBeInstanceOf(Model);
    expect(target1.smbCredential?.entityType).toEqual('credential');
    expect(target1.smbCredential?.id).toEqual('123');
    expect(target2.smbCredential).toBeUndefined();
    expect(target3.smbCredential).toBeUndefined();
  });

  test('should parse snmp credentials', () => {
    const target1 = Target.fromElement({snmp_credential: {_id: '123'}});
    const target2 = Target.fromElement({snmp_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.snmpCredential).toBeInstanceOf(Model);
    expect(target1.snmpCredential?.entityType).toEqual('credential');
    expect(target1.snmpCredential?.id).toEqual('123');
    expect(target2.snmpCredential).toBeUndefined();
    expect(target3.snmpCredential).toBeUndefined();
  });

  test('should parse ssh credentials', () => {
    const target1 = Target.fromElement({ssh_credential: {_id: '123'}});
    const target2 = Target.fromElement({ssh_credential: {_id: ''}});
    const target3 = Target.fromElement({});
    const target4 = Target.fromElement({
      ssh_credential: {_id: '456', port: 2222},
    });

    expect(target1.sshCredential).toBeInstanceOf(Model);
    expect(target1.sshCredential?.entityType).toEqual('credential');
    expect(target1.sshCredential?.id).toEqual('123');
    expect(target2.sshCredential).toBeUndefined();
    expect(target3.sshCredential).toBeUndefined();
    expect(target4.sshCredential).toBeInstanceOf(Model);
    expect(target4.sshCredential?.entityType).toEqual('credential');
    expect(target4.sshCredential?.id).toEqual('456');
    expect(target4.sshCredential?.port).toEqual(2222);
  });

  test('should parse ssh elevate credentials', () => {
    const target1 = Target.fromElement({ssh_elevate_credential: {_id: '123'}});
    const target2 = Target.fromElement({ssh_elevate_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.sshElevateCredential).toBeInstanceOf(Model);
    expect(target1.sshElevateCredential?.entityType).toEqual('credential');
    expect(target1.sshElevateCredential?.id).toEqual('123');
    expect(target2.sshElevateCredential).toBeUndefined();
    expect(target3.sshElevateCredential).toBeUndefined();
  });

  test('should parse esxi credentials', () => {
    const target1 = Target.fromElement({esxi_credential: {_id: '123'}});
    const target2 = Target.fromElement({esxi_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.esxiCredential).toBeInstanceOf(Model);
    expect(target1.esxiCredential?.entityType).toEqual('credential');
    expect(target1.esxiCredential?.id).toEqual('123');
    expect(target2.esxiCredential).toBeUndefined();
    expect(target3.esxiCredential).toBeUndefined();
  });

  test('should parse krb5 credentials', () => {
    const target1 = Target.fromElement({krb5_credential: {_id: '123'}});
    const target2 = Target.fromElement({krb5_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.krb5Credential).toBeInstanceOf(Model);
    expect(target1.krb5Credential?.entityType).toEqual('credential');
    expect(target1.krb5Credential?.id).toEqual('123');
    expect(target2.krb5Credential).toBeUndefined();
    expect(target3.krb5Credential).toBeUndefined();
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

    expect(target1.excludeHosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(target2.excludeHosts).toEqual([]);
  });

  test('should parse max_hosts', () => {
    const target = Target.fromElement({max_hosts: 42});

    expect(target.maxHosts).toEqual(42);
  });

  test('should parse allowSimultaneousIps', () => {
    const target1 = Target.fromElement({allow_simultaneous_ips: 1});
    const target2 = Target.fromElement({allow_simultaneous_ips: 0});
    // @ts-expect-error
    const target3 = Target.fromElement({allow_simultaneous_ips: 'foo'});

    expect(target1.allowSimultaneousIPs).toEqual(true);
    expect(target2.allowSimultaneousIPs).toEqual(false);
    expect(target3.allowSimultaneousIPs).toEqual(false);
  });

  test('should parse reverse_lookup_only', () => {
    const target1 = Target.fromElement({reverse_lookup_only: 0});
    const target2 = Target.fromElement({reverse_lookup_only: 1});
    // @ts-expect-error
    const target3 = Target.fromElement({reverse_lookup_only: 'foo'});

    expect(target1.reverseLookupOnly).toEqual(false);
    expect(target2.reverseLookupOnly).toEqual(true);
    expect(target3.reverseLookupOnly).toEqual(false);
  });

  test('should parse reverse_lookup_unify', () => {
    const target1 = Target.fromElement({reverse_lookup_unify: 0});
    const target2 = Target.fromElement({reverse_lookup_unify: 1});
    // @ts-expect-error
    const target3 = Target.fromElement({reverse_lookup_unify: 'foo'});

    expect(target1.reverseLookupUnify).toEqual(false);
    expect(target2.reverseLookupUnify).toEqual(true);
    expect(target3.reverseLookupUnify).toEqual(false);
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

  test('should parse tasks with usage_type', () => {
    const target = Target.fromElement({
      tasks: {
        task: [
          {
            _id: '123',
            name: 'task1',
            usage_type: 'scan',
          },
          {
            _id: '456',
            name: 'audit1',
            usage_type: 'audit',
          },
        ],
      },
    });

    expect(target.tasks?.length).toEqual(2);

    const task = target.tasks?.[0];
    expect(task).toBeDefined();
    expect(task).toBeInstanceOf(Model);
    expect(task?.entityType).toEqual('task');
    expect(task?.id).toEqual('123');
    expect(task?.name).toEqual('task1');

    const audit = target.tasks?.[1];
    expect(audit).toBeDefined();
    expect(audit).toBeInstanceOf(Model);
    expect(audit?.entityType).toEqual('audit');
    expect(audit?.id).toEqual('456');
    expect(audit?.name).toEqual('audit1');
  });

  test('should parse alive_tests', () => {
    const target = Target.fromElement({alive_tests: {alive_test: ICMP_PING}});
    expect(target.aliveTests).toEqual([ICMP_PING]);

    const target1 = Target.fromElement({
      alive_tests: {alive_test: [ICMP_PING, ARP_PING]},
    });
    expect(target1.aliveTests).toEqual([ICMP_PING, ARP_PING]);

    const target2 = Target.fromElement({alive_tests: {}});
    expect(target2.aliveTests).toEqual([]);

    const target3 = Target.fromElement({alive_tests: {alive_test: []}});
    expect(target3.aliveTests).toEqual([]);
  });
});
