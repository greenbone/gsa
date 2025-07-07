/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportTlsCertificate from 'gmp/models/report/tlscertificate';
import {parseDate} from 'gmp/parser';

describe('ReportTlsCertificate tests', () => {
  test('should use defaults', () => {
    const cert = new ReportTlsCertificate();
    expect(cert.activationTime).toBeUndefined();
    expect(cert.data).toBeUndefined();
    expect(cert.expirationTime).toBeUndefined();
    expect(cert.fingerprint).toBeUndefined();
    expect(cert.hostname).toBeUndefined();
    expect(cert.ip).toBeUndefined();
    expect(cert.issuerDn).toBeUndefined();
    expect(cert.md5Fingerprint).toBeUndefined();
    expect(cert.port).toBeUndefined();
    expect(cert.ports).toEqual([]);
    expect(cert.serial).toBeUndefined();
    expect(cert.sha256Fingerprint).toBeUndefined();
    expect(cert.subjectDn).toBeUndefined();
    expect(cert.valid).toBeUndefined();
  });

  test('should parse empty element', () => {
    const cert = ReportTlsCertificate.fromElement();
    expect(cert.activationTime).toBeUndefined();
    expect(cert.data).toBeUndefined();
    expect(cert.expirationTime).toBeUndefined();
    expect(cert.fingerprint).toBeUndefined();
    expect(cert.hostname).toBeUndefined();
    expect(cert.ip).toBeUndefined();
    expect(cert.issuerDn).toBeUndefined();
    expect(cert.md5Fingerprint).toBeUndefined();
    expect(cert.port).toBeUndefined();
    expect(cert.ports).toEqual([]);
    expect(cert.serial).toBeUndefined();
    expect(cert.sha256Fingerprint).toBeUndefined();
    expect(cert.subjectDn).toBeUndefined();
    expect(cert.valid).toBeUndefined();
  });

  test('should parse activation time', () => {
    const cert = ReportTlsCertificate.fromElement({
      activation_time: '2024-01-01T00:00:00Z',
    });
    expect(cert.activationTime).toEqual(parseDate('2024-01-01T00:00:00.000Z'));
  });

  test('should parse data', () => {
    const cert = ReportTlsCertificate.fromElement({
      certificate: {
        __text: 'certificate data',
        _format: 'PEM',
      },
    });
    expect(cert.data).toEqual('certificate data');
  });

  test('should parse expiration time', () => {
    const cert = ReportTlsCertificate.fromElement({
      expiration_time: '2024-12-31T23:59:59Z',
    });
    expect(cert.expirationTime).toEqual(parseDate('2024-12-31T23:59:59.000Z'));
  });

  test('should parse fingerprint', () => {
    const cert = ReportTlsCertificate.fromElement({
      name: 'fingerprint',
    });
    expect(cert.fingerprint).toEqual('fingerprint');
  });

  test('should parse hostname', () => {
    const cert = ReportTlsCertificate.fromElement({
      host: {
        hostname: 'example.com',
      },
    });
    expect(cert.hostname).toEqual('example.com');
  });

  test('should parse IP address', () => {
    const cert = ReportTlsCertificate.fromElement({
      host: {
        ip: '1.1.1.1',
      },
    });
    expect(cert.ip).toEqual('1.1.1.1');
  });

  test('should parse issuer DN', () => {
    const cert = ReportTlsCertificate.fromElement({
      issuer_dn: 'CN=Example Issuer',
    });
    expect(cert.issuerDn).toEqual('CN=Example Issuer');
  });

  test('should parse MD5 fingerprint', () => {
    const cert = ReportTlsCertificate.fromElement({
      md5_fingerprint: 'md5-fingerprint',
    });
    expect(cert.md5Fingerprint).toEqual('md5-fingerprint');
  });

  test('should parse ports', () => {
    const cert = ReportTlsCertificate.fromElement({
      ports: {
        port: [443],
      },
    });
    expect(cert.ports).toEqual(['443']);

    const cert2 = ReportTlsCertificate.fromElement({
      ports: {port: 80},
    });
    expect(cert2.ports).toEqual(['80']);
  });

  test('should parse serial number', () => {
    const cert = ReportTlsCertificate.fromElement({
      serial: '1234567890',
    });
    expect(cert.serial).toEqual('1234567890');
  });

  test('should parse SHA256 fingerprint', () => {
    const cert = ReportTlsCertificate.fromElement({
      sha256_fingerprint: 'sha256-fingerprint',
    });
    expect(cert.sha256Fingerprint).toEqual('sha256-fingerprint');
  });

  test('should parse subject DN', () => {
    const cert = ReportTlsCertificate.fromElement({
      subject_dn: 'CN=Example Subject',
    });
    expect(cert.subjectDn).toEqual('CN=Example Subject');
  });

  test('should parse valid status', () => {
    const cert = ReportTlsCertificate.fromElement({
      valid: 1,
    });
    expect(cert.valid).toEqual(true);

    const cert2 = ReportTlsCertificate.fromElement({
      valid: 0,
    });
    expect(cert2.valid).toEqual(false);
  });

  test('should print id', () => {
    const cert = new ReportTlsCertificate({
      ip: '1.1.1.1',
      port: '443',
      fingerprint: 'sha256-fingerprint',
    });
    expect(cert.id).toEqual('1.1.1.1:443:sha256-fingerprint');
  });

  test('should allow copying with new properties', () => {
    const cert = new ReportTlsCertificate({
      activationTime: parseDate('2024-01-01T00:00:00Z'),
      data: 'certificate data',
      expirationTime: parseDate('2024-12-31T23:59:59Z'),
      fingerprint: 'fingerprint',
      hostname: 'example.com',
      ip: '1.1.1.1',
      issuerDn: 'CN=Example Issuer',
      md5Fingerprint: 'md5-fingerprint',
      port: '443',
      ports: ['443'],
      serial: '1234567890',
      sha256Fingerprint: 'sha256-fingerprint',
      subjectDn: 'CN=Example Subject',
      valid: true,
    });
    const copiedCert = cert.copy({
      port: '8443',
      ports: undefined,
    });
    expect(copiedCert.activationTime).toEqual(cert.activationTime);
    expect(copiedCert.data).toEqual(cert.data);
    expect(copiedCert.expirationTime).toEqual(cert.expirationTime);
    expect(copiedCert.fingerprint).toEqual(cert.fingerprint);
    expect(copiedCert.hostname).toEqual(cert.hostname);
    expect(copiedCert.ip).toEqual(cert.ip);
    expect(copiedCert.issuerDn).toEqual(cert.issuerDn);
    expect(copiedCert.md5Fingerprint).toEqual(cert.md5Fingerprint);
    expect(copiedCert.port).toEqual('8443');
    expect(copiedCert.ports).toEqual([]);
    expect(copiedCert.serial).toEqual(cert.serial);
    expect(copiedCert.sha256Fingerprint).toEqual(cert.sha256Fingerprint);
    expect(copiedCert.subjectDn).toEqual(cert.subjectDn);
    expect(copiedCert.valid).toEqual(cert.valid);

    const copiedCert2 = cert.copy({
      activationTime: parseDate('2024-02-01T00:00:00Z'),
      data: 'new certificate data',
      expirationTime: parseDate('2025-12-31T23:59:59Z'),
      fingerprint: 'new-fingerprint',
      hostname: 'new-example.com',
      ip: '2.2.2.2',
      issuerDn: 'CN=New Example Issuer',
      md5Fingerprint: 'new-md5-fingerprint',
      port: '8443',
      ports: ['8443'],
      serial: '0987654321',
      sha256Fingerprint: 'new-sha256-fingerprint',
      subjectDn: 'CN=New Example Subject',
      valid: false,
    });
    expect(copiedCert2.activationTime).toEqual(
      parseDate('2024-02-01T00:00:00.000Z'),
    );
    expect(copiedCert2.data).toEqual('new certificate data');
    expect(copiedCert2.expirationTime).toEqual(
      parseDate('2025-12-31T23:59:59.000Z'),
    );
    expect(copiedCert2.fingerprint).toEqual('new-fingerprint');
    expect(copiedCert2.hostname).toEqual('new-example.com');
    expect(copiedCert2.ip).toEqual('2.2.2.2');
    expect(copiedCert2.issuerDn).toEqual('CN=New Example Issuer');
    expect(copiedCert2.md5Fingerprint).toEqual('new-md5-fingerprint');
    expect(copiedCert2.port).toEqual('8443');
    expect(copiedCert2.ports).toEqual(['8443']);
    expect(copiedCert2.serial).toEqual('0987654321');
    expect(copiedCert2.sha256Fingerprint).toEqual('new-sha256-fingerprint');
    expect(copiedCert2.subjectDn).toEqual('CN=New Example Subject');
    expect(copiedCert2.valid).toEqual(false);
  });
});
