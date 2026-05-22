/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import addPrefix from 'web/utils/add-prefix';

describe('addPrefix tests', () => {
  test('should add prefix when provided', () => {
    const result = addPrefix('test');
    expect(result('foo')).toBe('test_foo');
  });

  test('should return empty string when no prefix is provided', () => {
    const result = addPrefix();
    expect(result('foo')).toBe('foo');
  });
});
