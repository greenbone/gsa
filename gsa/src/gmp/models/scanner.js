/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {_} from 'gmp/locale/lang';

import {hasValue, isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import {parseInt, parseYesNo, parseDate} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import Credential from './credential';
import Task from './task';

export const OSP_SCANNER_TYPE = 1;
export const OPENVAS_SCANNER_TYPE = 2;
export const CVE_SCANNER_TYPE = 3;
export const GREENBONE_SENSOR_SCANNER_TYPE = 5;

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';

export const PARAM_TYPE_OVALDEF_FILE = 'osp_ovaldef_file';
export const PARAM_TYPE_SELECTION = 'osp_selection';
export const PARAM_TYPE_BOOLEAN = 'osp_boolean';

export const openVasScannersFilter = config =>
  config.scannerType === OPENVAS_SCANNER_TYPE;
export const ospScannersFilter = config =>
  config.scannerType === OSP_SCANNER_TYPE;

export function scannerTypeInt(scannerType) {
  if (scannerType === 'OSP_SCANNER_TYPE') {
    return OSP_SCANNER_TYPE;
  } else if (scannerType === 'OPENVAS_SCANNER_TYPE') {
    return OPENVAS_SCANNER_TYPE;
  } else if (scannerType === 'CVE_SCANNER_TYPE') {
    return CVE_SCANNER_TYPE;
  } else if (scannerType === 'GREENBONE_SENSOR_SCANNER_TYPE') {
    return GREENBONE_SENSOR_SCANNER_TYPE;
  }
  return _('Unknown type ({{type}})', {type: scannerType});
}

export function scannerTypeName(scannerType) {
  scannerType = parseInt(scannerType);
  if (scannerType === OSP_SCANNER_TYPE) {
    return _('OSP Scanner');
  } else if (scannerType === OPENVAS_SCANNER_TYPE) {
    return _('OpenVAS Scanner');
  } else if (scannerType === CVE_SCANNER_TYPE) {
    return _('CVE Scanner');
  } else if (scannerType === GREENBONE_SENSOR_SCANNER_TYPE) {
    return _('Greenbone Sensor');
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

  static parseObject(object) {
    const copy = super.parseObject(object);

    copy.scannerType = scannerTypeInt(object.type);

    copy.credential =
      hasValue(copy.credential) && hasValue(copy.credential._id)
        ? Credential.fromElement(copy.credential)
        : undefined;

    if (hasValue(copy.caPub) && hasValue(copy.caPub.certificate)) {
      if (hasValue(copy.caPub.info)) {
        copy.caPub.info.activationTime = parseDate(
          copy.caPub.info.activationTime,
        );
        copy.caPub.info.expirationTime = parseDate(
          copy.caPub.info.expirationTime,
        );
      }
    } else {
      delete copy.caPub;
    }

    if (hasValue(copy.tasks)) {
      copy.tasks = map(copy.tasks.task, task => Task.fromObject(task));
    } else {
      copy.tasks = [];
    }

    if (hasValue(copy.configs)) {
      copy.configs = map(copy.configs.config, config =>
        parseModelFromElement(config, 'scanconfig'),
      );
    } else {
      copy.configs = [];
    }

    // ToDo: parse copy.info

    return copy;
  }

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (hasValue(element.uuid) && !hasValue(element.id)) {
      ret.id = element.uuid;
    }

    // scanner.type can be one of three formats:
    // integer 2 (for scanners), '2' (audits) and 'OPENVAS_SCANNER_TYPE' (hyperion)
    if (isString(element.type) && element.type.length > 2) {
      ret.scannerType = scannerTypeInt(element.type); // 'OPENVAS_SCANNER_TYPE' -> 2
    } else {
      ret.scannerType = parseInt(element.type); // '2' and 2 maps to 2.
    }

    ret.credential =
      isDefined(ret.credential) && !isEmpty(ret.credential._id)
        ? Credential.fromElement(ret.credential)
        : undefined;

    if (isEmpty(element.ca_pub)) {
      delete ret.ca_pub;
    } else {
      ret.caPub = {
        certificate: element.ca_pub,
      };

      if (isDefined(element.ca_pub_info)) {
        ret.caPub.info = element.ca_pub_info;
        ret.caPub.info.activationTime = parseDate(
          element.ca_pub_info.activation_time,
        );
        ret.caPub.info.expirationTime = parseDate(
          element.ca_pub_info.expiration_time,
        );
        delete ret.ca_pub_info;
      }
    }

    if (isDefined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task =>
        parseModelFromElement(task, 'task'),
      );
    } else {
      ret.tasks = [];
    }

    if (isEmpty(ret.configs)) {
      ret.configs = [];
    } else {
      ret.configs = map(ret.configs.config, config =>
        parseModelFromElement(config, 'scanconfig'),
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
