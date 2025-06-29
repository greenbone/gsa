/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';

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
    expect(caps.map(cap => cap)).toEqual([]);
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
    expect(caps.map(cap => cap)).toEqual(['everything']);
  });

  test('should ignore case for capabilities', () => {
    const caps = new Capabilities(['GET_TASKS']);

    expect(caps.has('get_tasks')).toEqual(true);
    expect(caps.has('GET_TASKS')).toEqual(true);
    expect(caps.has('get_TASKS')).toEqual(true);
    expect(caps.mayOp('get_tasks')).toEqual(true);
    expect(caps.mayOp('GET_TASKS')).toEqual(true);
    expect(caps.mayOp('get_TASKS')).toEqual(true);
    expect(caps.map(cap => cap)).toEqual(['get_tasks']);
  });

  test('should allow singular and plural for access', () => {
    const caps = new Capabilities(['get_tasks']);

    expect(caps.mayAccess('task')).toEqual(true);
    expect(caps.mayAccess('tasks')).toEqual(true);
    expect(caps.map(cap => cap)).toEqual(['get_tasks']);
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
    expect(caps.mayAccess('certbund')).toEqual(true);
    expect(caps.mayAccess('certbunds')).toEqual(true);
    expect(caps.mayAccess('secinfo')).toEqual(true);
    expect(caps.mayAccess('secinfos')).toEqual(true);

    expect(caps.mayClone('cve')).toEqual(true);
    expect(caps.mayClone('cpe')).toEqual(true);
    expect(caps.mayClone('dfncert')).toEqual(true);
    expect(caps.mayClone('nvt')).toEqual(true);
    expect(caps.mayClone('certbund')).toEqual(true);
    expect(caps.mayClone('secinfo')).toEqual(true);

    expect(caps.mayCreate('cve')).toEqual(true);
    expect(caps.mayCreate('cpe')).toEqual(true);
    expect(caps.mayCreate('dfncert')).toEqual(true);
    expect(caps.mayCreate('nvt')).toEqual(true);
    expect(caps.mayCreate('certbund')).toEqual(true);
    expect(caps.mayCreate('secinfo')).toEqual(true);

    expect(caps.mayDelete('cve')).toEqual(true);
    expect(caps.mayDelete('cpe')).toEqual(true);
    expect(caps.mayDelete('dfncert')).toEqual(true);
    expect(caps.mayDelete('nvt')).toEqual(true);
    expect(caps.mayDelete('certbund')).toEqual(true);
    expect(caps.mayDelete('secinfo')).toEqual(true);

    expect(caps.mayEdit('cve')).toEqual(true);
    expect(caps.mayEdit('cpe')).toEqual(true);
    expect(caps.mayEdit('dfncert')).toEqual(true);
    expect(caps.mayEdit('nvt')).toEqual(true);
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

  test('should handle features', () => {
    const featureList = [
      {name: 'ENABLED_FEATURE_1', _enabled: 1},
      {name: 'DISABLED_FEATURE', _enabled: 0},
      {name: 'ENABLED_FEATURE_2', _enabled: 1},
    ];
    const caps = new Capabilities(['everything'], featureList);
    expect(caps.featureEnabled('ENABLED_FEATURE_1')).toBe(true);
    expect(caps.featureEnabled('DISABLED_FEATURE')).toBe(false);
    expect(caps.featureEnabled('enabled_feature_2')).toBe(true);
    expect(caps.featureEnabled('UNDEFINED_FEATURE')).toBe(false);
  });

  test('should support ticket capabilities', () => {
    const caps = new Capabilities([
      'get_tickets',
      'create_ticket',
      'delete_ticket',
      'modify_ticket',
    ]);

    expect(caps.mayAccess('ticket')).toEqual(true);
    expect(caps.mayAccess('tickets')).toEqual(true);

    expect(caps.mayClone('ticket')).toEqual(true);
    expect(caps.mayCreate('ticket')).toEqual(true);
    expect(caps.mayDelete('ticket')).toEqual(true);
    expect(caps.mayEdit('ticket')).toEqual(true);

    expect(caps.mayAccess('other')).toEqual(false);
  });

  test('should map capabilities to strings', () => {
    const caps = new Capabilities(['get_tasks', 'create_task']);

    expect(caps.map(cap => cap)).toEqual(['get_tasks', 'create_task']);
  });
});
