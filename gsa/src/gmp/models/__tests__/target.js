/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import Model from 'gmp/model';
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

// vim: set ts=2 sw=2 tw=80:
