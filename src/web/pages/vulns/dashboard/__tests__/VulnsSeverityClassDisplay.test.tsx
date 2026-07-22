/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {
  VulnsSeverityDisplay,
  VulnsSeverityTableDisplay,
} from 'web/pages/vulns/dashboard/VulnsSeverityClassDisplay';

describe('VulnsSeverityDisplay', () => {
  test('should export VulnsSeverityDisplay', () => {
    expect(VulnsSeverityDisplay).toBeDefined();
    expect(typeof VulnsSeverityDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsSeverityDisplay.displayId).toBe('vuln-by-severity-class');
  });

  test('should have displayName', () => {
    expect(VulnsSeverityDisplay.displayName).toContain('VulnsSeverityDisplay');
  });
});

describe('VulnsSeverityTableDisplay', () => {
  test('should export VulnsSeverityTableDisplay', () => {
    expect(VulnsSeverityTableDisplay).toBeDefined();
    expect(typeof VulnsSeverityTableDisplay).toBe('function');
  });

  test('should have correct displayId', () => {
    expect(VulnsSeverityTableDisplay.displayId).toBe(
      'vuln-by-severity-class-table',
    );
  });

  test('should have displayName', () => {
    expect(VulnsSeverityTableDisplay.displayName).toContain(
      'VulnsSeverityTableDisplay',
    );
  });
});
