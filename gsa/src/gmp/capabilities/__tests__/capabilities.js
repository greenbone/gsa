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
import Capabilities from '../capabilities';

describe('Capabilities tests', () => {
  test('should not have capabilities', () => {
    const caps = new Capabilities();

    expect(caps.areDefined()).toEqual(false);
    expect(caps.length).toEqual(0);
    expect(caps.has('get_tasks')).toEqual(false);
    expect(caps.mayOp('get_tasks')).toEqual(false);
    expect(caps.mayAccess('tasks')).toEqual(false);
    expect(caps.mayClone('tasks')).toEqual(false);
    expect(caps.mayCreate('tasks')).toEqual(false);
    expect(caps.mayDelete('tasks')).toEqual(false);
    expect(caps.mayEdit('tasks')).toEqual(false);
  });

  test('should allow everything', () => {
    const caps = new Capabilities(['everything']);

    expect(caps.areDefined()).toEqual(true);
    expect(caps.length).toEqual(1);
    expect(caps.has('get_tasks')).toEqual(false);
    expect(caps.has('everything')).toEqual(true);
    expect(caps.mayOp('get_tasks')).toEqual(true);
    expect(caps.mayAccess('tasks')).toEqual(true);
    expect(caps.mayClone('tasks')).toEqual(true);
    expect(caps.mayCreate('tasks')).toEqual(true);
    expect(caps.mayDelete('tasks')).toEqual(true);
    expect(caps.mayEdit('tasks')).toEqual(true);
    expect(caps.mayOp('get_foo')).toEqual(true);
    expect(caps.mayAccess('foo')).toEqual(true);
    expect(caps.mayClone('foo')).toEqual(true);
    expect(caps.mayCreate('foo')).toEqual(true);
    expect(caps.mayDelete('foo')).toEqual(true);
    expect(caps.mayEdit('foo')).toEqual(true);
  });

  test('should ignore case for capabilities', () => {
    const caps = new Capabilities(['GET_TASKS']);

    expect(caps.has('get_tasks')).toEqual(true);
    expect(caps.has('GET_TASKS')).toEqual(true);
    expect(caps.has('get_TASKS')).toEqual(true);
    expect(caps.mayOp('get_tasks')).toEqual(true);
    expect(caps.mayOp('GET_TASKS')).toEqual(true);
    expect(caps.mayOp('get_TASKS')).toEqual(true);
  });

  test('should allow singular and plural for access', () => {
    const caps = new Capabilities(['get_tasks']);

    expect(caps.mayAccess('task')).toEqual(true);
    expect(caps.mayAccess('tasks')).toEqual(true);
  });

  test('should have only access task capabilities', () => {
    const caps = new Capabilities(['get_tasks']);

    expect(caps.mayAccess('task')).toEqual(true);

    expect(caps.mayAccess('other')).toEqual(false);

    expect(caps.mayClone('task')).toEqual(false);
    expect(caps.mayCreate('task')).toEqual(false);
    expect(caps.mayDelete('task')).toEqual(false);
    expect(caps.mayEdit('task')).toEqual(false);
  });

  test('should have only clone and create task capabilities', () => {
    const caps = new Capabilities(['create_task']); // create perm allows also to clone

    expect(caps.mayClone('task')).toEqual(true);
    expect(caps.mayCreate('task')).toEqual(true);

    expect(caps.mayClone('other')).toEqual(false);

    expect(caps.mayAccess('task')).toEqual(false);
    expect(caps.mayDelete('task')).toEqual(false);
    expect(caps.mayEdit('task')).toEqual(false);
  });

  test('should have only delete task capabilities', () => {
    const caps = new Capabilities(['delete_task']);

    expect(caps.mayDelete('task')).toEqual(true);

    expect(caps.mayDelete('other')).toEqual(false);

    expect(caps.mayAccess('task')).toEqual(false);
    expect(caps.mayClone('task')).toEqual(false);
    expect(caps.mayCreate('task')).toEqual(false);
    expect(caps.mayEdit('task')).toEqual(false);
  });

  test('should have only edit task capabilities', () => {
    const caps = new Capabilities(['modify_task']);

    expect(caps.mayEdit('task')).toEqual(true);

    expect(caps.mayEdit('other')).toEqual(false);

    expect(caps.mayAccess('task')).toEqual(false);
    expect(caps.mayClone('task')).toEqual(false);
    expect(caps.mayCreate('task')).toEqual(false);
    expect(caps.mayDelete('task')).toEqual(false);
  });

  test('should support asset types', () => {
    const caps = new Capabilities([
      'get_assets',
      'create_asset',
      'delete_asset',
      'modify_asset',
    ]);

    expect(caps.mayAccess('host')).toEqual(true);
    expect(caps.mayAccess('hosts')).toEqual(true);
    expect(caps.mayAccess('os')).toEqual(true);
    expect(caps.mayAccess('operatingsystem')).toEqual(true);
    expect(caps.mayAccess('operatingsystems')).toEqual(true);

    expect(caps.mayClone('host')).toEqual(true);
    expect(caps.mayClone('operatingsystem')).toEqual(true);

    expect(caps.mayCreate('host')).toEqual(true);
    expect(caps.mayCreate('operatingsystem')).toEqual(true);

    expect(caps.mayDelete('host')).toEqual(true);
    expect(caps.mayDelete('operatingsystem')).toEqual(true);

    expect(caps.mayEdit('host')).toEqual(true);
    expect(caps.mayEdit('operatingsystem')).toEqual(true);

    expect(caps.mayAccess('other')).toEqual(false);
    expect(caps.mayClone('other')).toEqual(false);
    expect(caps.mayCreate('other')).toEqual(false);
    expect(caps.mayDelete('other')).toEqual(false);
    expect(caps.mayEdit('other')).toEqual(false);
  });

  test('should support info types', () => {
    const caps = new Capabilities([
      'get_info',
      'create_info',
      'delete_info',
      'modify_info',
    ]);

    expect(caps.mayAccess('cve')).toEqual(true);
    expect(caps.mayAccess('cves')).toEqual(true);
    expect(caps.mayAccess('cpe')).toEqual(true);
    expect(caps.mayAccess('cpes')).toEqual(true);
    expect(caps.mayAccess('dfncert')).toEqual(true);
    expect(caps.mayAccess('dfncerts')).toEqual(true);
    expect(caps.mayAccess('nvt')).toEqual(true);
    expect(caps.mayAccess('nvts')).toEqual(true);
    expect(caps.mayAccess('ovaldef')).toEqual(true);
    expect(caps.mayAccess('ovaldefs')).toEqual(true);
    expect(caps.mayAccess('certbund')).toEqual(true);
    expect(caps.mayAccess('certbunds')).toEqual(true);
    expect(caps.mayAccess('secinfo')).toEqual(true);
    expect(caps.mayAccess('secinfos')).toEqual(true);

    expect(caps.mayClone('cve')).toEqual(true);
    expect(caps.mayClone('cpe')).toEqual(true);
    expect(caps.mayClone('dfncert')).toEqual(true);
    expect(caps.mayClone('nvt')).toEqual(true);
    expect(caps.mayClone('ovaldef')).toEqual(true);
    expect(caps.mayClone('certbund')).toEqual(true);
    expect(caps.mayClone('secinfo')).toEqual(true);

    expect(caps.mayCreate('cve')).toEqual(true);
    expect(caps.mayCreate('cpe')).toEqual(true);
    expect(caps.mayCreate('dfncert')).toEqual(true);
    expect(caps.mayCreate('nvt')).toEqual(true);
    expect(caps.mayCreate('ovaldef')).toEqual(true);
    expect(caps.mayCreate('certbund')).toEqual(true);
    expect(caps.mayCreate('secinfo')).toEqual(true);

    expect(caps.mayDelete('cve')).toEqual(true);
    expect(caps.mayDelete('cpe')).toEqual(true);
    expect(caps.mayDelete('dfncert')).toEqual(true);
    expect(caps.mayDelete('nvt')).toEqual(true);
    expect(caps.mayDelete('ovaldef')).toEqual(true);
    expect(caps.mayDelete('certbund')).toEqual(true);
    expect(caps.mayDelete('secinfo')).toEqual(true);

    expect(caps.mayEdit('cve')).toEqual(true);
    expect(caps.mayEdit('cpe')).toEqual(true);
    expect(caps.mayEdit('dfncert')).toEqual(true);
    expect(caps.mayEdit('nvt')).toEqual(true);
    expect(caps.mayEdit('ovaldef')).toEqual(true);
    expect(caps.mayEdit('certbund')).toEqual(true);
    expect(caps.mayEdit('secinfo')).toEqual(true);

    expect(caps.mayAccess('other')).toEqual(false);
    expect(caps.mayClone('other')).toEqual(false);
    expect(caps.mayCreate('other')).toEqual(false);
    expect(caps.mayDelete('other')).toEqual(false);
    expect(caps.mayEdit('other')).toEqual(false);
  });

  test('should allow iterating', () => {
    const capList = ['get_tasks', 'create_task', 'delete_task', 'modify_task'];
    const caps = new Capabilities(capList);

    expect(caps.length).toEqual(4);

    let i = 0;
    for (const cap of caps) {
      i++;
      expect(capList).toEqual(expect.arrayContaining([cap]));
    }
    expect(i).toEqual(4);
  });

  test('should support mapping', () => {
    const mapFunc = jest.fn((entry, i) => i);
    const capList = ['get_tasks', 'create_task', 'delete_task', 'modify_task'];
    const caps = new Capabilities(capList);

    expect(caps.length).toEqual(4);

    const mappedCaps = caps.map(mapFunc);

    expect(caps.length).toEqual(4);
    expect(mapFunc).toHaveBeenCalledTimes(4);
    expect(mappedCaps).toEqual([0, 1, 2, 3]);
  });
});

// vim: set ts=2 sw=2 tw=80:
