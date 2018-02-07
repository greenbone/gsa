/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import moment from 'moment';

import _ from '../locale.js';

import {is_defined, is_string} from '../utils/identity';
import {is_empty} from '../utils/string';
import {map} from '../utils/array';

import {parse_int, parse_yesno} from '../parser.js';

import Model from '../model.js';

import Credential from './credential.js';

export const OSP_SCANNER_TYPE = 1;
export const OPENVAS_SCANNER_TYPE = 2;
export const CVE_SCANNER_TYPE = 3;
export const SLAVE_SCANNER_TYPE = 4;

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';

export const PARAM_TYPE_OVALDEF_FILE = 'osp_ovaldef_file';
export const PARAM_TYPE_SELECTION = 'osp_selection';
export const PARAM_TYPE_BOOLEAN = 'osp_boolean';

export function scanner_type_name(scanner_type) {
  scanner_type = parse_int(scanner_type);
  if (scanner_type === OSP_SCANNER_TYPE) {
    return _('OSP Scanner');
  }
  else if (scanner_type === OPENVAS_SCANNER_TYPE) {
    return _('OpenVAS Scanner');
  }
  else if (scanner_type === CVE_SCANNER_TYPE) {
    return _('CVE Scanner');
  }
  else if (scanner_type === SLAVE_SCANNER_TYPE) {
    return _('GMP Scanner');
  }
  return _('Unknown type ({{type}})', {type: scanner_type});
}

const parse_scanner_info = (info = {}) => {
  const data = {};

  if (!is_empty(info.name)) {
    data.name = info.name;
  }
  if (!is_empty(info.version)) {
    data.version = info.version;
  }

  return data;
};

class Scanner extends Model {

  static entity_type = 'scanner';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.scanner_type = parse_int(elem.type);

    ret.credential = is_defined(ret.credential) &&
      !is_empty(ret.credential._id) ? new Credential(ret.credential) :
      undefined;

    if (is_empty(ret.ca_pub)) {
      delete ret.ca_pub;
    }
    else {
      ret.ca_pub = {
        certificate: ret.ca_pub,
      };

      if (is_defined(ret.ca_pub_info)) {
        ret.ca_pub.info = ret.ca_pub_info;
        ret.ca_pub.info.activation_time = moment(
          ret.ca_pub.info.activation_time
        );
        ret.ca_pub.info.expiration_time = moment(
          ret.ca_pub.info.expiration_time
        );
        delete ret.ca_pub_info;
      }
    }

    if (is_defined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task => new Model(task, 'task'));
    }
    else {
      ret.tasks = [];
    }

    if (is_empty(ret.configs)) {
      ret.configs = [];
    }
    else {
      ret.configs = map(ret.configs.config,
        config => new Model(config, 'config'));
    }

    if (is_defined(ret.info)) {
      const {scanner, daemon, description, params, protocol} = ret.info;

      ret.info.scanner = parse_scanner_info(scanner);
      ret.info.daemon = parse_scanner_info(daemon);
      ret.info.protocol = parse_scanner_info(protocol);

      if (is_empty(description)) {
        delete ret.info.description;
      }
      if (is_empty(params)) {
        delete ret.info.params;
      }
      else {
        ret.info.params = map(ret.info.params.param, param => ({
          name: param.name,
          description: param.description,
          param_type: param.type,
          mandatory: parse_yesno(param.mandatory),
          default: param.default,
        }));
      }
    }

    return ret;
  }

  hasUnixSocket() {
    return is_string(this.host) && this.host[0] === '/';
  }
}

export default Scanner;

// vim: set ts=2 sw=2 tw=80:
