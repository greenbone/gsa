/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseBoolean} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {pluralizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

interface Feature {
  name: string;
  _enabled: string | boolean | number;
}

const types = {
  auditreport: 'audit_report',
  auditreports: 'audit_reports',
  host: 'asset',
  hosts: 'asset',
  os: 'asset',
  cve: 'info',
  cves: 'info',
  cpe: 'info',
  cpes: 'info',
  dfncert: 'info',
  dfncerts: 'info',
  nvt: 'info',
  nvts: 'info',
  operatingsystem: 'asset',
  operatingsystems: 'asset',
  certbund: 'info',
  certbunds: 'info',
  secinfo: 'info',
  secinfos: 'info',
  policy: 'config',
  policies: 'config',
  portlist: 'port_list',
  portlists: 'port_list',
  reportconfig: 'report_config',
  reportconfigs: 'report_config',
  reportformat: 'report_format',
  reportformats: 'report_format',
  scanconfig: 'config',
  scanconfigs: 'config',
  ticket: 'ticket',
  tickets: 'ticket',
  tlscertificate: 'tls_certificate',
  tlscertificates: 'tls_certificate',
} as const;

const subtypes = {
  audit: 'task',
  audits: 'task',
  audit_report: 'report',
  audit_reports: 'reports',
} as const;

const convertType = (type: string): string => {
  const cType = types[type];
  if (isDefined(cType)) {
    type = cType;
  }
  return subtypes[type] || type;
};

class Capabilities {
  private readonly _hasCaps: boolean;
  private readonly _hasFeatures: boolean;
  private readonly _capabilities: Set<string>;
  private readonly _featuresEnabled: Record<string, boolean>;

  constructor(capNames?: string[], featuresList?: Feature[]) {
    this._hasCaps = isDefined(capNames);
    this._hasFeatures = isDefined(featuresList);

    let caps: string[] = [];
    let featuresEnabled: Record<string, boolean> = {};

    if (this._hasCaps) {
      caps = map(capNames, name => name.toLowerCase());
    }

    if (this._hasFeatures) {
      forEach(featuresList, feature => {
        featuresEnabled[feature.name.toUpperCase()] = parseBoolean(
          feature._enabled,
        );
      });
    }

    this._capabilities = new Set(caps);
    this._featuresEnabled = featuresEnabled;
  }

  [Symbol.iterator]() {
    return this._capabilities[Symbol.iterator]();
  }

  areDefined() {
    return this._hasCaps;
  }

  has(name: string) {
    return this._capabilities.has(name.toLowerCase());
  }

  mayOp(value: string) {
    return this.has(value) || this.has('everything');
  }

  mayAccess(type: string) {
    return this.mayOp('get_' + pluralizeType(convertType(type)));
  }

  mayClone(type: string) {
    return this.mayOp('create_' + convertType(type));
  }

  mayEdit(type: string) {
    return this.mayOp('modify_' + convertType(type));
  }

  mayDelete(type: string) {
    return this.mayOp('delete_' + convertType(type));
  }

  mayCreate(type: string) {
    return this.mayOp('create_' + convertType(type));
  }

  get length() {
    return this._capabilities.size;
  }

  featureEnabled(feature: string) {
    return this._featuresEnabled[feature.toUpperCase()] === true;
  }

  map<T>(callbackfn: (value: string, index: number, array: string[]) => T) {
    return Array.from(this._capabilities).map(callbackfn);
  }
}

export default Capabilities;
