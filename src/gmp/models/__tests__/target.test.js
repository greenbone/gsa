/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import PortList from 'gmp/models/portlist';
import Target from 'gmp/models/target';
import {testModel} from 'gmp/models/testing';

testModel(Target, 'target');

describe('Target model tests', () => {
  test('should parse port_list', () => {
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
    expect(target1.port_list.entityType).toEqual('portlist');
    expect(target1.port_list.id).toEqual('123');
    expect(target2.port_list).toBeUndefined();
    expect(target3.port_list).toBeUndefined();
  });

  test('should parse credentials', () => {
    const target1 = Target.fromElement({smb_credential: {_id: '123'}});
    const target2 = Target.fromElement({smb_credential: {_id: ''}});
    const target3 = Target.fromElement({});

    expect(target1.smb_credential).toBeInstanceOf(Model);
    expect(target1.smb_credential.entityType).toEqual('credential');
    expect(target1.smb_credential.id).toEqual('123');
    expect(target2.smb_credential).toBeUndefined();
    expect(target3.smb_credential).toBeUndefined();
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
    const target = Target.fromElement({max_hosts: '42'});

    expect(target.max_hosts).toEqual(42);
  });

  test('should parse allow_simultaneous_ips', () => {
    const target = Target.fromElement({allow_simultaneous_ips: '1'});
    const target2 = Target.fromElement({allow_simultaneous_ips: '0'});

    expect(target.allowSimultaneousIPs).toEqual(1);
    expect(target2.allowSimultaneousIPs).toEqual(0);
  });

  test('should parse reverse_lookup_only', () => {
    const target = Target.fromElement({reverse_lookup_only: '0'});

    expect(target.reverse_lookup_only).toEqual(0);
  });

  test('should parse reverse_lookup_unify', () => {
    const target = Target.fromElement({reverse_lookup_unify: '1'});

    expect(target.reverse_lookup_unify).toEqual(1);
  });

  test('should parse tasks', () => {
    const elem = {
      tasks: {
        task: [
          {
            _id: '123',
          },
        ],
      },
    };
    const target = Target.fromElement(elem);

    expect(target.tasks[0]).toBeInstanceOf(Model);
    expect(target.tasks[0].entityType).toEqual('task');
    expect(target.tasks[0].id).toEqual('123');
  });
});
