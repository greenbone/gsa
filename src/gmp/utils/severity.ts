/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const SEVERITY_RATING_CVSS_2 = 'CVSSv2';
export const SEVERITY_RATING_CVSS_3 = 'CVSSv3';
export const DEFAULT_SEVERITY_RATING = SEVERITY_RATING_CVSS_2;

export type SeverityRating =
  | typeof SEVERITY_RATING_CVSS_2
  | typeof SEVERITY_RATING_CVSS_3;
