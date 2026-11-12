/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import getOperatingSystemNameFromCpe from 'web/utils/operating-system-name';

describe('getOperatingSystemNameFromCpe', () => {
  test.each([
    ['debian', 'debian'],
    ['ubuntu_linux', 'ubuntu linux'],
    ['almalinux', 'almalinux'],
    ['FutureOS_Enterprise-Edge', 'FutureOS Enterprise-Edge'],
    [String.raw`product\:edition`, 'product:edition'],
    [String.raw`product\\edition`, String.raw`product\edition`],
    [String.raw`product\!`, 'product!'],
  ])('should extract %s without OS-specific rules', (product, name) => {
    expect(
      getOperatingSystemNameFromCpe(
        `cpe:2.3:o:vendor:${product}:1:-:-:-:-:-:x86_64:-`,
      ),
    ).toBe(name);
  });

  test('should respect escaped separators in other fields', () => {
    expect(
      getOperatingSystemNameFromCpe(
        String.raw`cpe:2.3:o:vendor\:name:Some_OS:1:-:-:-:-:-:x86_64:-`,
      ),
    ).toBe('Some OS');
  });

  test.each([
    undefined,
    '',
    'not a CPE',
    'cpe:2.3:o:vendor:product',
    'cpe:2.3:o:vendor:product:1:-:-:-:-:-:x86_64:-:extra',
    'cpe:2.3:a:vendor:product:1:-:-:-:-:-:x86_64:-',
    'cpe:2.3:o:vendor::1:-:-:-:-:-:x86_64:-',
    'cpe:2.3:o:vendor:*:1:-:-:-:-:-:x86_64:-',
    'cpe:2.3:o:vendor:-:1:-:-:-:-:-:x86_64:-',
    'cpe:2.3:o:vendor:product:1:-:-:-:-:-:x86_64:-\\',
  ])('should return no name for %s', cpe => {
    expect(getOperatingSystemNameFromCpe(cpe)).toBeUndefined();
  });
});
