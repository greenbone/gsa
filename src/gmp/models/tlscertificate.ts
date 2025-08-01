/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseBoolean, parseDate, parseToString, YesNo} from 'gmp/parser';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

type TimeStatus = keyof typeof TIME_STATUS;

interface SourceElement {
  _id?: string;
  location?: {
    _id?: string;
    host?: {
      asset: {
        _id: string;
      };
      ip: string;
    };
    port?: string | number;
  };
  origin?: {
    _id?: string;
    origin_data?: string;
    origin_id?: string;
    origin_type?: string;
    report?: {
      _id?: string;
      date: string;
      task?: {
        _id?: string;
        name?: string;
      };
    };
  };
  timestamp?: string;
  tls_versions?: string;
}

interface TlsCertificateElement extends ModelElement {
  activation_time?: string;
  certificate?: {
    __text: string;
    _format?: string;
  };
  expiration_time?: string;
  issuer_dn?: string;
  last_seen?: string;
  md5_fingerprint?: string;
  serial?: string;
  sha256_fingerprint?: string;
  sources?: {
    source: SourceElement | SourceElement[];
  };
  subject_dn?: string;
  time_status?: TimeStatus;
  trust?: YesNo;
  valid?: YesNo;
}

interface SourceReport {
  id: string;
  timestamp?: Date;
}

interface SourceHost {
  id: string;
  ip?: string;
}

interface TlsCertificateProperties extends ModelProperties {
  activationTime?: Date;
  certificate?: string;
  expirationTime?: Date;
  issuerDn?: string;
  lastSeen?: Date;
  md5Fingerprint?: string;
  serial?: string;
  sha256Fingerprint?: string;
  sourceHosts?: SourceHost[];
  sourcePorts?: string[];
  sourceReports?: SourceReport[];
  subjectDn?: string;
  timeStatus?: TimeStatus;
  trust?: boolean;
  valid?: boolean;
}

export const TIME_STATUS = {
  inactive: 'inactive',
  valid: 'valid',
  expired: 'expired',
  unknown: 'unknown',
} as const;

export const TIME_STATUS_TRANSLATIONS = {
  [TIME_STATUS.expired]: _l('Expired'),
  [TIME_STATUS.inactive]: _l('Inactive'),
  [TIME_STATUS.unknown]: _l('Unknown'),
  [TIME_STATUS.valid]: _l('Valid'),
} as const;

export const getTranslatableTimeStatus = (status: TimeStatus) =>
  `${TIME_STATUS_TRANSLATIONS[status]}`;

class TlsCertificate extends Model {
  static entityType = 'tlscertificate';

  readonly activationTime?: Date;
  readonly certificate?: string;
  readonly expirationTime?: Date;
  readonly issuerDn?: string;
  readonly lastSeen?: Date;
  readonly md5Fingerprint?: string;
  readonly serial?: string;
  readonly sha256Fingerprint?: string;
  readonly sourceHosts: SourceHost[];
  readonly sourcePorts: string[];
  readonly sourceReports: SourceReport[];
  readonly subjectDn?: string;
  readonly timeStatus?: TimeStatus;
  readonly trust?: boolean;
  readonly valid?: boolean;

  constructor({
    activationTime,
    certificate,
    expirationTime,
    issuerDn,
    lastSeen,
    md5Fingerprint,
    serial,
    sha256Fingerprint,
    sourceHosts = [],
    sourcePorts = [],
    sourceReports = [],
    subjectDn,
    timeStatus,
    trust,
    valid,
    ...properties
  }: TlsCertificateProperties = {}) {
    super(properties);

    this.activationTime = activationTime;
    this.certificate = certificate;
    this.expirationTime = expirationTime;
    this.issuerDn = issuerDn;
    this.lastSeen = lastSeen;
    this.md5Fingerprint = md5Fingerprint;
    this.serial = serial;
    this.sha256Fingerprint = sha256Fingerprint;
    this.sourceHosts = sourceHosts;
    this.sourcePorts = sourcePorts;
    this.sourceReports = sourceReports;
    this.subjectDn = subjectDn;
    this.timeStatus = timeStatus;
    this.trust = trust;
    this.valid = valid;
  }

  static fromElement(element: TlsCertificateElement = {}): TlsCertificate {
    return new TlsCertificate(this.parseElement(element));
  }

  static parseElement(
    element: TlsCertificateElement = {},
  ): TlsCertificateProperties {
    const ret = super.parseElement(element) as TlsCertificateProperties;

    ret.certificate = isDefined(element.certificate)
      ? element.certificate.__text
      : undefined;

    // Use subject DN as name
    ret.name = parseToString(element.subject_dn);
    ret.subjectDn = ret.name;
    ret.issuerDn = element.issuer_dn;
    ret.serial = parseToString(element.serial);

    ret.activationTime =
      element.activation_time === 'undefined' ||
      element.activation_time === 'unlimited'
        ? undefined
        : parseDate(element.activation_time);

    ret.expirationTime =
      element.expiration_time === 'undefined' ||
      element.expiration_time === 'unlimited'
        ? undefined
        : parseDate(element.expiration_time);

    ret.lastSeen =
      element.last_seen === 'undefined' || element.last_seen === 'unlimited'
        ? undefined
        : parseDate(element.last_seen);

    ret.timeStatus = element.time_status;

    const sourceReports = new Set<string>();
    const sourceHosts = new Set<string>();
    const sourcePorts = new Set<string>();

    // in order for the Sets to work properly with unique object values
    // (Set uses object references, so for our purposes it contains duplicates)
    // we parse them into a string, put the string into the set (making it
    // unique) and in the end parse the strings back to objects with the correct
    // values and keys
    if (isDefined(element.sources)) {
      forEach(element.sources.source, source => {
        if (isDefined(source.origin)) {
          if (source.origin.origin_type === 'Report') {
            sourceReports.add(JSON.stringify(source.origin));
          }
        }
        if (isDefined(source.location)) {
          if (isDefined(source.location.host)) {
            sourceHosts.add(JSON.stringify(source.location.host));
          }
          if (isDefined(source.location.port)) {
            sourcePorts.add(String(source.location.port));
          }
        }
      });
    }

    ret.sourceReports = [...sourceReports].map(report => {
      const originObject = JSON.parse(report);
      return {
        id: originObject.origin_id,
        timestamp: parseDate(originObject?.report?.date),
      };
    });
    ret.sourceHosts = [...sourceHosts].map(host => {
      const hostObject = JSON.parse(host);
      return {
        id: hostObject.asset._id,
        ip: hostObject.ip,
      };
    });
    ret.sourcePorts = [...sourcePorts];

    ret.valid = isDefined(element.valid)
      ? parseBoolean(element.valid)
      : undefined;
    ret.trust = isDefined(element.trust)
      ? parseBoolean(element.trust)
      : undefined;

    ret.md5Fingerprint = element.md5_fingerprint;
    ret.sha256Fingerprint = element.sha256_fingerprint;

    return ret;
  }
}

export default TlsCertificate;
