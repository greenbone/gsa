/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Settings from 'gmp/models/settings';

describe('Settings model tests', () => {
  test('settings have working setters and getters', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');
    const res = settings.get('foo');
    const res2 = settings.get('');

    expect(res).toEqual('bar');
    expect(res2).toEqual({});
  });

  test('getEntries() should return all settings', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');
    settings.set('lorem', 'ipsum');

    expect(settings.getEntries()).toEqual([
      ['foo', 'bar'],
      ['lorem', 'ipsum'],
    ]);
  });

  test('should not have non existing key', () => {
    const settings = new Settings();
    expect(settings.has('foo')).toEqual(false);
  });

  test('should have existing key', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');

    expect(settings.has('foo')).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
