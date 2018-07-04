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
import {is_defined} from './identity';

export const getEntityType = (model = {}) => {
  const {entity_type: entityType} = model;
  if (entityType === 'info' && is_defined(model.info_type)) {
    return model.info_type;
  }
  if (entityType === 'asset' && is_defined(model.asset_type)) {
    return model.asset_type;
  }
  return entityType;
};

export const pluralizeType = type => type[type.length - 1] === 's' ||
  type === 'info' || type === 'version' ? type : type + 's';

const types = {
  config: 'scanconfig',
  cert_bund_adv: 'certbund',
  dfn_cert_adv: 'dfncert',
  os: 'operatingsystem',
  port_list: 'portlist',
  report_format: 'reportformat',
};

export const normalizeType = type => {
  const ctype = types[type];
  return is_defined(ctype) ? ctype : type;
};

// vim: set ts=2 sw=2 tw=80:
