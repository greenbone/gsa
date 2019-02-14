/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
    const target1 = new Target(elem1);
    const target2 = new Target(elem2);
    const target3 = new Target({});

    expect(target1.port_list).toBeInstanceOf(PortList);
    expect(target2.port_list).toBeUndefined();
    expect(target3.port_list).toBeUndefined();
  });

  test('should parse credentials', () => {
    const target1 = new Target({smb_credential: {_id: '123'}});
    const target2 = new Target({smb_credential: {_id: ''}});
    const target3 = new Target({});

    expect(target1.smb_credential).toBeInstanceOf(Model);
    expect(target1.smb_credential.entityType).toEqual('credential');
    expect(target2.smb_credential).toBeUndefined();
    expect(target3.smb_credential).toBeUndefined();
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const target1 = new Target(elem);
    const target2 = new Target({hosts: ''});

    expect(target1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(target2.hosts).toEqual([]);
  });

  test('should parse exclude_hosts or return empty array', () => {
    const elem = {
      exclude_hosts: '123.456.789.42, 987.654.321.1',
    };
    const target1 = new Target(elem);
    const target2 = new Target({exclude_hosts: ''});

    expect(target1.exclude_hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(target2.exclude_hosts).toEqual([]);
  });

  test('should parse max_hosts', () => {
    const target = new Target({max_hosts: '42'});

    expect(target.max_hosts).toEqual(42);
  });

  test('should parse reverse_lookup_only', () => {
    const target = new Target({reverse_lookup_only: '0'});

    expect(target.reverse_lookup_only).toEqual(0);
  });

  test('should parse reverse_lookup_unify', () => {
    const target = new Target({reverse_lookup_unify: '1'});

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
    const target = new Target(elem);

    expect(target.tasks[0]).toBeInstanceOf(Model);
    expect(target.tasks[0].entityType).toEqual('task');
  });
});

// vim: set ts=2 sw=2 tw=80:
