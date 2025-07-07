/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const COMPLIANCE = {
  YES: 'yes',
  NO: 'no',
  INCOMPLETE: 'incomplete',
  UNDEFINED: 'undefined',
} as const;

export type ComplianceType = (typeof COMPLIANCE)[keyof typeof COMPLIANCE];
