/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, it, expect} from 'vitest';
import osObject from 'web/utils/Os.jsx';

describe('osObject.find fallbacks', () => {
  it('matches a specific Debian version before fallbacks', () => {
    const res = osObject.find('cpe:/o:debian:debian_linux:8.3');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('cpe:/o:debian:debian_linux:8.3');
  });

  it('uses vendor-level fallback (Oracle) when no specific entry exists', () => {
    const res = osObject.find('cpe:/o:oracle:linux:7.9');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('cpe:/o:oracle');
  });

  it('uses the generic linux catch-all when no vendor match exists', () => {
    const res = osObject.find('cpe:/o:somevendor:some_linux:1.0');
    expect(res).toBeDefined();
    expect(res?.pattern).toBe('linux');
  });

  it('throws for non-string input', () => {
    expect(() => osObject.find(null)).toThrow();
    expect(() => osObject.find(undefined)).toThrow();
  });
});
