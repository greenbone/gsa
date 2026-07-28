/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createPEMCertificate} from 'web/utils/certificates';

describe('createPEMCertificate', () => {
  test('should wrap certificate data with PEM delimiters', () => {
    const data = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArandomdata';
    const result = createPEMCertificate(data);

    expect(result).toBe(
      '-----BEGIN CERTIFICATE-----\n' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArandomdata\n' +
        '-----END CERTIFICATE-----',
    );
  });

  test('should return delimiters with a blank line when data is empty', () => {
    const result = createPEMCertificate('');

    expect(result).toBe(
      '-----BEGIN CERTIFICATE-----\n\n-----END CERTIFICATE-----',
    );
  });

  test('should preserve multiline certificate data exactly', () => {
    const data = 'line1\nline2\nline3';
    const result = createPEMCertificate(data);

    expect(result).toBe(
      '-----BEGIN CERTIFICATE-----\nline1\nline2\nline3\n-----END CERTIFICATE-----',
    );
  });

  test('should not trim or modify surrounding whitespace in data', () => {
    const data = '  padded-certificate-data  ';
    const result = createPEMCertificate(data);

    expect(result).toBe(
      '-----BEGIN CERTIFICATE-----\n  padded-certificate-data  \n-----END CERTIFICATE-----',
    );
  });
});
