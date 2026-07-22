/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {
  VulnsCvssDisplay,
  VulnsCvssTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsCvssDisplay';

describe('VulnsCvssDisplay', () => {
  test('should export VulnsCvssDisplay', () => {
    expect(VulnsCvssDisplay).toBeDefined();
    expect(typeof VulnsCvssDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsCvssDisplay.displayId).toBe('vuln-by-cvss');
  });

  test('should have displayName', () => {
    expect(VulnsCvssDisplay.displayName).toContain('VulnsCvssDisplay');
  });
});

describe('VulnsCvssTableDisplay', () => {
  test('should export VulnsCvssTableDisplay', () => {
    expect(VulnsCvssTableDisplay).toBeDefined();
    expect(typeof VulnsCvssTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsCvssTableDisplay.displayId).toBe('vuln-by-cvss-table');
  });

  test('should have displayName', () => {
    expect(VulnsCvssTableDisplay.displayName).toContain(
      'VulnsCvssTableDisplay',
    );
  });
});
