/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';
import {is_defined, is_empty, is_string, parse_int} from '../../utils.js';

import Model from '../model.js';

import Credential from './credential.js';

export const OSP_SCANNER_TYPE = 1;
export const OPENVAS_SCANNER_TYPE = 2;
export const CVE_SCANNER_TYPE = 3;
export const SLAVE_SCANNER_TYPE = 4;

export const OSP_SCAN_CONFIG_TYPE = 1;
export const OPENVAS_SCAN_CONFIG_TYPE = 0;

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';
export const OPENVAS_CONFIG_FULL_AND_FAST_ID =
  'daba56c8-73ec-11df-a475-002264764cea';
export const OPENVAS_CONFIG_EMPTY_ID = '085569ce-73ed-11df-83c3-002264764cea';

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
    return _('OMP Slave');
  }
  return _('Unknown type ({{type}})', scanner_type);
}

export class Scanner extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);
    ret.type = parse_int(ret.type);
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

    // TODO parse tasks and configs
    return ret;
  }

  hasUnixSocket() {
    return is_string(this.host) && this.host[0] === '/';
  }
}

export default Scanner;

// vim: set ts=2 sw=2 tw=80:
