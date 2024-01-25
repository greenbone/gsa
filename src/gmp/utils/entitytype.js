/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {isDefined} from './identity';

/**
 * Return the entity type of a Model object
 *
 * @param {Object} model Model to get the entity type from
 *
 * @returns {String} The GSA entity type of a model
 */
export const getEntityType = (model = {}) => model.entityType;

/**
 * Convert a type into its pluralized form
 *
 * @param {String} type The entity type to pluralize
 *
 * @returns {String} The pluralized entity type
 */
export const pluralizeType = type => {
  if (type[type.length - 1] === 's' || type === 'info') {
    return type;
  } else if (type === 'policy') {
    return 'policies';
  } else if (type === 'vulnerability') {
    return 'vulns';
  }
  return type + 's';
};
const TYPES = {
  config: 'scanconfig',
  cert_bund_adv: 'certbund',
  dfn_cert_adv: 'dfncert',
  os: 'operatingsystem',
  port_list: 'portlist',
  port_range: 'portrange',
  report_config: 'reportconfig',
  report_format: 'reportformat',
  tls_certificate: 'tlscertificate',
  vuln: 'vulnerability',
};

/**
 * Convert a type to the GSA type name
 *
 * @param {String} type An entity type e.g. from a request
 *
 * @returns {String} Entity type name used in GSA
 */
export const normalizeType = type => {
  const ctype = TYPES[type];
  return isDefined(ctype) ? ctype : type;
};

const ENTITY_TYPES = {
  alert: _l('Alert'),
  asset: _l('Asset'),
  auditreport: _l('Audit Report'),
  certbund: _l('CERT-Bund Advisory'),
  cpe: _l('CPE'),
  credential: _l('Credential'),
  cve: _l('CVE'),
  dfncert: _l('DFN-CERT Advisory'),
  filter: _l('Filter'),
  group: _l('Group'),
  host: _l('Host'),
  info: _l('Info'),
  operatingsystem: _l('Operating System'),
  override: _l('Override'),
  note: _l('Note'),
  nvt: _l('NVT'),
  permission: _l('Permission'),
  portlist: _l('Port List'),
  portrange: _l('Port Range'),
  report: _l('Report'),
  reportconfig: _l('Report Config'),
  reportformat: _l('Report Format'),
  result: _l('Result'),
  role: _l('Role'),
  scanconfig: _l('Scan Config'),
  scanner: _l('Scanner'),
  schedule: _l('Schedule'),
  tag: _l('Tag'),
  target: _l('Target'),
  task: _l('Task'),
  ticket: _l('Ticket'),
  tlscertificate: _l('TLS Certificate'),
  user: _l('User'),
  vulnerability: _l('Vulnerability'),
};

/**
 * Get the translateable name for an entity type
 *
 * @param {String} type A entity type. Either an external or GSA entity type.
 *
 * @returns {String} A translated entity type name
 */
export const typeName = type => {
  type = normalizeType(type);
  const name = ENTITY_TYPES[type];
  return isDefined(name) ? `${name}` : type;
};

const CMD_TYPES = {
  auditreport: 'audit_report',
  scanconfig: 'config',
  certbund: 'cert_bund_adv',
  dfncert: 'dfn_cert_adv',
  operatingsystem: 'os',
  portlist: 'port_list',
  portrange: 'port_range',
  reportconfig: 'report_config',
  reportformat: 'report_format',
  tlscertificate: 'tls_certificate',
  vulnerability: 'vuln',
};

/**
 * Convert a GSA entity type into a API type
 *
 * @param {String} type GSA entity type
 *
 * @returns {String} API type
 */
export const apiType = type => {
  const name = CMD_TYPES[type];
  return isDefined(name) ? name : type;
};

// vim: set ts=2 sw=2 tw=80:
