/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l, _} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';

export interface EntityType {
  entityType: string;
}

/**
 * Return the entity type of a Model object
 *
 * @param model Model to get the entity type from
 *
 * @returns The GSA entity type of a model
 */
export const getEntityType = (model: EntityType): string => model.entityType;

/**
 * Convert a type into its pluralized form
 *
 * @param {String} type The entity type to pluralize
 *
 * @returns {String} The pluralized entity type
 */
export const pluralizeType = (type: string): string => {
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
  audit_report: 'auditreport',
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
} as const;

/**
 * Convert a type to the GSA type name
 *
 * @param {String} [type] An entity type e.g. from a request
 *
 * @returns {String} Entity type name used in GSA
 */
export const normalizeType = (type?: string): string | undefined => {
  const cType = TYPES[type as keyof typeof TYPES];
  return isDefined(cType) ? cType : type;
};

const ENTITY_TYPES = {
  alert: _l('Alert'),
  asset: _l('Asset'),
  audit: _l('Audit'),
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
  policy: _l('Policy'),
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
} as const;

/**
 * Get the translatable name for an entity type
 *
 * @param {String} [type] A entity type. Either an external or GSA entity type.
 *
 * @returns {String} A translated entity type name
 */
export const typeName = (type?: string): string => {
  type = normalizeType(type);
  const name = type
    ? ENTITY_TYPES[type as keyof typeof ENTITY_TYPES]
    : undefined;
  return isDefined(name) ? String(name) : _('Unknown');
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
} as const;

/**
 * Convert a GSA entity type into a API type
 *
 * @param {String} type GSA entity type
 *
 * @returns {String} API type
 */
export const apiType = (type?: string): string | undefined => {
  const name = type ? CMD_TYPES[type as keyof typeof CMD_TYPES] : undefined;
  return isDefined(name) ? name : type;
};
