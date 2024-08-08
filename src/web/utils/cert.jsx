/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


const BEGIN_CERTIFICATE = '-----BEGIN CERTIFICATE-----';
const END_CERTIFICATE = '-----END CERTIFICATE-----';

export const create_pem_certificate = data => {
  return [BEGIN_CERTIFICATE, data, END_CERTIFICATE].join('\n');
};

// vim: set ts=2 sw=2 tw=80:
