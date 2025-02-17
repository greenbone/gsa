/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import EverythingCapabilities from '../everything';

describe('EverythingCapabilities tests', () => {
  test('should allow everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.mayOp('foo')).toEqual(true);
    expect(caps.mayAccess('foo')).toEqual(true);
    expect(caps.mayClone('foo')).toEqual(true);
    expect(caps.mayCreate('foo')).toEqual(true);
    expect(caps.mayDelete('foo')).toEqual(true);
    expect(caps.mayEdit('foo')).toEqual(true);
  });

  test('should have everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.length).toEqual(1);
    expect(caps.areDefined()).toEqual(true);
    expect(caps.has('everything')).toEqual(true);
  });
});
