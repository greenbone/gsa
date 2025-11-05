/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {parseBoolean, parseDate, parseToString, type YesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export interface ReportTLSCertificateElement {
  activation_time?: string;
  certificate?: {
    __text?: string;
    _format?: string;
  };
  expiration_time?: string;
  host?: {
    hostname?: string;
    ip?: string;
  };
  issuer_dn?: string;
  md5_fingerprint?: string;
  name?: string;
  ports?: {
    port?: number | number[];
  };
  serial?: string;
  sha256_fingerprint?: string;
  subject_dn?: string;
  valid?: YesNo;
}

interface ReportTLSCertificateProperties {
  activationTime?: Date;
  data?: string;
  expirationTime?: Date;
  fingerprint?: string;
  hostname?: string;
  ip?: string;
  issuerDn?: string;
  md5Fingerprint?: string;
  port?: string;
  ports?: string[];
  serial?: string;
  sha256Fingerprint?: string;
  subjectDn?: string;
  valid?: boolean;
}

class ReportTLSCertificate {
  readonly activationTime?: Date;
  readonly data?: string;
  readonly expirationTime?: Date;
  readonly fingerprint?: string;
  readonly hostname?: string;
  readonly ip?: string;
  readonly issuerDn?: string;
  readonly md5Fingerprint?: string;
  readonly port?: string;
  readonly ports: string[];
  readonly serial?: string;
  readonly sha256Fingerprint?: string;
  readonly subjectDn?: string;
  readonly valid?: boolean;

  constructor({
    activationTime,
    data,
    expirationTime,
    fingerprint,
    hostname,
    ip,
    issuerDn,
    md5Fingerprint,
    port,
    ports = [],
    serial,
    sha256Fingerprint,
    subjectDn,
    valid,
  }: ReportTLSCertificateProperties = {}) {
    this.activationTime = activationTime;
    this.data = data;
    this.expirationTime = expirationTime;
    this.fingerprint = fingerprint;
    this.hostname = hostname;
    this.ip = ip;
    this.issuerDn = issuerDn;
    this.md5Fingerprint = md5Fingerprint;
    this.port = port;
    this.ports = ports;
    this.serial = serial;
    this.sha256Fingerprint = sha256Fingerprint;
    this.subjectDn = subjectDn;
    this.valid = valid;
  }

  copy(props: ReportTLSCertificateProperties = {}): ReportTLSCertificate {
    return new ReportTLSCertificate({
      activationTime: this.activationTime,
      data: this.data,
      expirationTime: this.expirationTime,
      fingerprint: this.fingerprint,
      hostname: this.hostname,
      ip: this.ip,
      issuerDn: this.issuerDn,
      md5Fingerprint: this.md5Fingerprint,
      port: this.port,
      ports: this.ports,
      serial: this.serial,
      sha256Fingerprint: this.sha256Fingerprint,
      subjectDn: this.subjectDn,
      valid: this.valid,
      ...props,
    });
  }

  get id() {
    return `${this.ip}:${this.port}:${this.fingerprint}`;
  }

  static fromElement(
    element: ReportTLSCertificateElement = {},
  ): ReportTLSCertificate {
    return new ReportTLSCertificate(ReportTLSCertificate.parseElement(element));
  }

  static parseElement(
    element: ReportTLSCertificateElement = {},
  ): ReportTLSCertificateProperties {
    const {
      name,
      certificate,
      sha256_fingerprint,
      md5_fingerprint,
      valid,
      activation_time,
      expiration_time,
      subject_dn,
      issuer_dn,
      serial,
      host,
      ports,
    } = element;
    return {
      fingerprint: parseToString(name),
      data: isDefined(certificate) ? certificate.__text : undefined,
      sha256Fingerprint: sha256_fingerprint,
      md5Fingerprint: md5_fingerprint,
      activationTime:
        activation_time === 'undefined' || activation_time === 'unlimited'
          ? undefined
          : parseDate(activation_time),
      expirationTime:
        expiration_time === 'undefined' || expiration_time === 'unlimited'
          ? undefined
          : parseDate(expiration_time),
      valid: isDefined(valid) ? parseBoolean(valid) : undefined,
      subjectDn: subject_dn,
      issuerDn: issuer_dn,
      serial: serial,
      hostname: host?.hostname,
      ip: host?.ip,
      ports: map(ports?.port, port => parseToString(port) as string),
    };
  }
}

export default ReportTLSCertificate;
