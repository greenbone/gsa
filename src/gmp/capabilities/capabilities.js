/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {pluralizeType} from 'gmp/utils/entitytype';

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
  tlscertificate: 'tls_certificate',
  tlscertificates: 'tls_certificate',
};

const subtypes = {
  audit: 'task',
  audits: 'task',
  audit_report: 'report',
  audit_reports: 'reports',
};

const convertType = type => {
  const ctype = types[type];
  if (isDefined(ctype)) {
    type = ctype;
  }
  return subtypes[type] || type;
};

class Capabilities {
  constructor(cap_names) {
    this._has_caps = isDefined(cap_names);

    let caps;

    if (this._has_caps) {
      caps = map(cap_names, name => name.toLowerCase());
    }

    this._capabilities = new Set(caps);
  }

  [Symbol.iterator]() {
    return this._capabilities[Symbol.iterator]();
  }

  areDefined() {
    return this._has_caps;
  }

  has(name) {
    return this._capabilities.has(name.toLowerCase());
  }

  mayAccess(type) {
    return this.mayOp('get_' + pluralizeType(convertType(type)));
  }

  mayOp(value) {
    return this.has(value) || this.has('everything');
  }

  mayClone(type) {
    return this.mayOp('create_' + convertType(type));
  }

  mayEdit(type) {
    return this.mayOp('modify_' + convertType(type));
  }

  mayDelete(type) {
    return this.mayOp('delete_' + convertType(type));
  }

  mayCreate(type) {
    return this.mayOp('create_' + convertType(type));
  }

  get length() {
    return this._capabilities.size;
  }
}

export default Capabilities;

// vim: set ts=2 sw=2 tw=80:
