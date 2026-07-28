/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from 'vitest';
import findOperatingSystem from 'web/utils/operatingsystems';

describe('findOperatingSystem tests', () => {
  test('should match a specific Debian version before fallbacks', () => {
    const res = findOperatingSystem('cpe:/o:debian:debian_linux:8.3');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('cpe:/o:debian:debian_linux:8.3');
  });

  test('should use vendor-level fallback (Oracle) when no specific entry exists', () => {
    const res = findOperatingSystem('cpe:/o:oracle:linux:7.9');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('cpe:/o:oracle');
  });

  test('should use the generic linux catch-all when no vendor match exists', () => {
    const res = findOperatingSystem('cpe:/o:somevendor:some_linux:1.0');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('linux');
  });

  test("should return undefined when no match exists and the input doesn't contain 'linux'", () => {
    const res = findOperatingSystem('cpe:/o:unknownvendor:unknown_os:1.0');
    expect(res).toBeUndefined();
  });

  test('should throw for non-string input', () => {
    // @ts-expect-error Testing invalid input
    expect(() => findOperatingSystem(null)).toThrow();
    // @ts-expect-error Testing invalid input
    expect(() => findOperatingSystem(undefined)).toThrow();
  });
});
