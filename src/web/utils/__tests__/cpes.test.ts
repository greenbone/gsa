/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import findCPE from 'web/utils/cpes';

describe('findCPE', () => {
  test('should return matching CPE and icon for an application CPE', () => {
    const result = findCPE('cpe:/a:apache:http_server:2.4.62');

    expect(result).toEqual({
      pattern: 'cpe:/a:apache:http_server',
      icon: 'cpe/a:apache:http_server.svg',
    });
  });

  test('should match when the pattern appears within a longer string', () => {
    const result = findCPE('prefix cpe:/o:canonical:ubuntu_linux:24.04 suffix');

    expect(result).toEqual({
      pattern: 'cpe:/o:canonical:ubuntu_linux',
      icon: 'os_ubuntu.svg',
    });
  });

  test('should return undefined when no CPE pattern matches', () => {
    const result = findCPE('cpe:/a:unknown:nonexistent:1.0');

    expect(result).toBeUndefined();
  });

  test('should be case-sensitive when matching patterns', () => {
    const result = findCPE('CPE:/A:APACHE:HTTP_SERVER:2.4.62');

    expect(result).toBeUndefined();
  });

  test('should throw for non-string input', () => {
    // @ts-expect-error Testing invalid input
    expect(() => findCPE(null)).toThrow();
    // @ts-expect-error Testing invalid input
    expect(() => findCPE(undefined)).toThrow();
  });
});
