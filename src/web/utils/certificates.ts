/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const BEGIN_CERTIFICATE = '-----BEGIN CERTIFICATE-----' as const;
const END_CERTIFICATE = '-----END CERTIFICATE-----' as const;

export const createPEMCertificate = (data: string): string => {
  return [BEGIN_CERTIFICATE, data, END_CERTIFICATE].join('\n');
};
