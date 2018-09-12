/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import _ from '../locale';

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
export const pluralizeType = type => type[type.length - 1] === 's' ||
  type === 'info' ? type : type + 's';

const TYPES = {
  config: 'scanconfig',
  cert_bund_adv: 'certbund',
  dfn_cert_adv: 'dfncert',
  os: 'operatingsystem',
  port_list: 'portlist',
  port_range: 'portrange',
  report_format: 'reportformat',
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
  agent: _('Agent'),
  alert: _('Alert'),
  allinfo: _('All SecInfo'),
  asset: _('Asset'),
  certbund: _('CERT-Bund Advisory'),
  cpe: _('CPE'),
  credential: _('Credential'),
  cve: _('CVE'),
  dfncert: _('DFN-CERT Advisory'),
  filter: _('Filter'),
  group: _('Group'),
  host: _('Host'),
  info: _('Info'),
  operatingsystem: _('Operating System'),
  ovaldef: _('OVAL Definition'),
  override: _('Override'),
  note: _('Note'),
  nvt: _('NVT'),
  permission: _('Permission'),
  portlist: _('Port List'),
  portrange: _('Port Range'),
  report: _('Report'),
  reportformat: _('Report Format'),
  result: _('Result'),
  role: _('Role'),
  scanconfig: _('Scan Config'),
  scanner: _('Scanner'),
  schedule: _('Schedule'),
  tag: _('Tag'),
  target: _('Target'),
  task: _('Task'),
  user: _('User'),
  vulnerability: _('Vulnerability'),
};

/**
 * Get the translateable name for an entity type
 *
 * @param {String} type A entity type. Either an extrenal or GSA entity type.
 *
 * @returns {String} A translated entity type name
 */
export const typeName = type => {
  type = normalizeType(type);
  const name = ENTITY_TYPES[type];
  return isDefined(name) ? name : type;
};

const CMD_TYPES = {
  scanconfig: 'config',
  certbund: 'cert_bund_adv',
  dfncert: 'dfn_cert_adv',
  operatingsystem: 'os',
  portlist: 'port_list',
  portrange: 'port_range',
  reportformat: 'report_format',
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
