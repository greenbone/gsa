/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l, _} from 'gmp/locale/lang';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';

export interface WithEntityType {
  entityType: EntityType;
}

export type ApiType = (typeof API_TYPES)[number];
export type EntityType = keyof typeof ENTITY_TYPES;
export type NormalizeType = EntityType | ApiType | keyof typeof NORMALIZE_TYPES;

const log = logger.getLogger('gmp');
/**
 * Return the entity type of a Model object
 *
 * @param model Model to get the entity type from
 *
 * @returns The GSA entity type of a model
 */
export const getEntityType = (model: WithEntityType): EntityType =>
  model.entityType;

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

const NORMALIZE_TYPES = {
  agent_group: 'agentgroup',
  agent_installer: 'agentinstaller',
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
 * @param [type] An entity type e.g. from a request
 *
 * @returns Entity type name used in GSA
 */
export const normalizeType = (type?: NormalizeType): EntityType | undefined => {
  const cType = NORMALIZE_TYPES[type as keyof typeof NORMALIZE_TYPES];
  return isDefined(cType) ? cType : (type as EntityType | undefined);
};

const ENTITY_TYPES = {
  agent: _l('Agent'),
  agentgroup: _('Agent Group'),
  agentinstaller: _('Agent Installer'),
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
 * @param type A entity type. Either an external or GSA entity type.
 *
 * @returns A translated entity type name
 */
export const typeName = (type?: NormalizeType): string => {
  type = normalizeType(type);
  const name = isDefined(type) ? ENTITY_TYPES[type] : undefined;
  return isDefined(name) ? String(name) : _('Unknown');
};

const ENTITY_TO_API_TYPES = {
  agentgroup: 'agent_group',
  agentinstaller: 'agent_installer',
  audit: 'task',
  auditreport: 'report',
  certbund: 'info',
  cpe: 'info',
  cve: 'info',
  dfncert: 'info',
  host: 'asset',
  nvt: 'info',
  operatingsystem: 'asset',
  policy: 'config',
  portlist: 'port_list',
  portrange: 'port_range',
  reportconfig: 'report_config',
  reportformat: 'report_format',
  scanconfig: 'config',
  tlscertificate: 'tls_certificate',
  vulnerability: 'vuln',
} as const;

export const API_TYPES = [
  'agent_group',
  'agent_installer',
  'agent',
  'alert',
  'asset',
  'audit_report',
  'config',
  'credential',
  'feed',
  'filter',
  'group',
  'info',
  'note',
  'override',
  'permission',
  'port_list',
  'port_range',
  'report_config',
  'report_format',
  'report',
  'result',
  'role',
  'scanner',
  'schedule',
  'system_reports',
  'tag',
  'target',
  'task',
  'ticket',
  'tls_certificate',
  'user',
  'vuln',
] as const;

/**
 * Convert a GSA entity type into an API type
 *
 * @param type GSA entity type
 *
 * @returns API type
 */
export const apiType = (type?: EntityType | ApiType): ApiType | undefined => {
  if (!isDefined(type) || type.length === 0) {
    return undefined;
  }
  const apiType =
    ENTITY_TO_API_TYPES[type as keyof typeof ENTITY_TO_API_TYPES] ?? type;

  if (!API_TYPES.includes(apiType as ApiType)) {
    // for now we just log a warning here and return the type as-is
    // in future we might want to throw an error
    log.warn(`Unknown API type '${apiType}' for entity type '${type}'`);
  }
  return apiType as ApiType;
};
