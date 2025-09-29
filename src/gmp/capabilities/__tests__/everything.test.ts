/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';

describe('EverythingCapabilities tests', () => {
  test('should allow everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.mayOp('create_task')).toEqual(true);
    expect(caps.mayOp('modify_task')).toEqual(true);
    expect(caps.mayOp('delete_task')).toEqual(true);
    expect(caps.mayOp('get_tasks')).toEqual(true);
    expect(caps.mayAccess('task')).toEqual(true);
    expect(caps.mayClone('task')).toEqual(true);
    expect(caps.mayCreate('task')).toEqual(true);
    expect(caps.mayDelete('task')).toEqual(true);
    expect(caps.mayEdit('task')).toEqual(true);

    // @ts-expect-error
    expect(caps.mayOp('foo')).toEqual(true);
    // @ts-expect-error
    expect(caps.mayAccess('foo')).toEqual(true);
    // @ts-expect-error
    expect(caps.mayClone('foo')).toEqual(true);
    // @ts-expect-error
    expect(caps.mayCreate('foo')).toEqual(true);
    // @ts-expect-error
    expect(caps.mayDelete('foo')).toEqual(true);
    // @ts-expect-error
    expect(caps.mayEdit('foo')).toEqual(true);
  });

  test('should have everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.length).toEqual(1);
    expect(caps.areDefined()).toEqual(true);
    expect(Array.from(caps)).toEqual(['everything']);
  });
});
