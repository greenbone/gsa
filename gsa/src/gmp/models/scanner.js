/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {_} from '../locale/lang';

import {isDefined, isString} from '../utils/identity';
import {isEmpty} from '../utils/string';
import {map} from '../utils/array';

import {parseInt, parseYesNo, parseDate} from '../parser';

import Model from '../model';

import Credential from './credential';

export const OSP_SCANNER_TYPE = 1;
export const OPENVAS_SCANNER_TYPE = 2;
export const CVE_SCANNER_TYPE = 3;
export const GMP_SCANNER_TYPE = 4;

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';

export const PARAM_TYPE_OVALDEF_FILE = 'osp_ovaldef_file';
export const PARAM_TYPE_SELECTION = 'osp_selection';
export const PARAM_TYPE_BOOLEAN = 'osp_boolean';

export const openVasScannersFilter = config =>
  config.scannerType === OPENVAS_SCANNER_TYPE;
export const ospScannersFilter = config =>
  config.scannerType === OSP_SCANNER_TYPE;

export function scannerTypeName(scannerType) {
  scannerType = parseInt(scannerType);
  if (scannerType === OSP_SCANNER_TYPE) {
    return _('OSP Scanner');
  } else if (scannerType === OPENVAS_SCANNER_TYPE) {
    return _('OpenVAS Scanner');
  } else if (scannerType === CVE_SCANNER_TYPE) {
    return _('CVE Scanner');
  } else if (scannerType === GMP_SCANNER_TYPE) {
    return _('GMP Scanner');
  }
  return _('Unknown type ({{type}})', {type: scannerType});
}

const parse_scanner_info = (info = {}) => {
  const data = {};

  if (!isEmpty(info.name)) {
    data.name = info.name;
  }
  if (!isEmpty(info.version)) {
    data.version = info.version;
  }

  return data;
};

class Scanner extends Model {
  static entityType = 'scanner';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.scannerType = parseInt(elem.type);

    ret.credential =
      isDefined(ret.credential) && !isEmpty(ret.credential._id)
        ? new Credential(ret.credential)
        : undefined;

    if (isEmpty(elem.ca_pub)) {
      delete ret.ca_pub;
    } else {
      ret.caPub = {
        certificate: elem.ca_pub,
      };

      if (isDefined(elem.ca_pub_info)) {
        ret.caPub.info = elem.ca_pub_info;
        ret.caPub.info.activationTime = parseDate(
          elem.ca_pub_info.activation_time,
        );
        ret.caPub.info.expirationTime = parseDate(
          elem.ca_pub_info.expiration_time,
        );
        delete ret.ca_pub_info;
      }
    }

    if (isDefined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task => new Model(task, 'task'));
    } else {
      ret.tasks = [];
    }

    if (isEmpty(ret.configs)) {
      ret.configs = [];
    } else {
      ret.configs = map(
        ret.configs.config,
        config => new Model(config, 'scanconfig'),
      );
    }

    if (isDefined(ret.info)) {
      const {scanner, daemon, description, params, protocol} = ret.info;

      ret.info.scanner = parse_scanner_info(scanner);
      ret.info.daemon = parse_scanner_info(daemon);
      ret.info.protocol = parse_scanner_info(protocol);

      if (isEmpty(description)) {
        delete ret.info.description;
      }
      if (isEmpty(params)) {
        delete ret.info.params;
      } else {
        ret.info.params = map(ret.info.params.param, param => ({
          name: param.name,
          description: param.description,
          paramType: param.type,
          mandatory: parseYesNo(param.mandatory),
          default: param.default,
        }));
        delete ret.info.params.param;
      }
    }

    return ret;
  }

  isClonable() {
    return (
      this.scannerType !== CVE_SCANNER_TYPE &&
      this.scannerType !== OPENVAS_SCANNER_TYPE
    );
  }

  isWritable() {
    return (
      super.isWritable() &&
      this.scannerType !== CVE_SCANNER_TYPE &&
      this.scannerType !== OPENVAS_SCANNER_TYPE
    );
  }

  hasUnixSocket() {
    return isString(this.host) && this.host[0] === '/';
  }
}

export default Scanner;

// vim: set ts=2 sw=2 tw=80:
