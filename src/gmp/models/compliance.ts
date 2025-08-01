/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

export type ComplianceType = (typeof COMPLIANCE)[keyof typeof COMPLIANCE];

export const COMPLIANCE = {
  YES: 'yes',
  NO: 'no',
  INCOMPLETE: 'incomplete',
  UNDEFINED: 'undefined',
} as const;

const COMPLIANCE_TRANSLATIONS = {
  yes: _l('Yes'),
  no: _l('No'),
  incomplete: _l('Incomplete'),
  undefined: _l('Undefined'),
} as const;

export const getTranslatableReportCompliance = (compliance: ComplianceType) =>
  `${COMPLIANCE_TRANSLATIONS[compliance]}`;
