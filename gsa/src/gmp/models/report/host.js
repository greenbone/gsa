/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {setProperties, parseInt, parseDate} from 'gmp/parser';

const parse_count = value => {
  const parsed = parseInt(value);

  if (isDefined(parsed)) {
    return parsed;
  }

  return 0;
};

const parse_page_count = value => {
  if (isDefined(value)) {
    return parse_count(value.page);
  }
  return 0;
};

class Host {
  constructor() {
    this.authSuccess = {};
    this.details = {};
    this.result_counts = {
      false_positive: 0,
      high: 0,
      info: 0,
      log: 0,
      warning: 0,
      total: 0,
    };
  }

  static fromElement(element) {
    const host = new Host();

    setProperties(this.parseElement(element), host);

    return host;
  }

  static parseElement(element = {}) {
    const copy = {...element};

    const {asset = {}, port_count = {}, result_count} = element;

    if (isEmpty(asset._asset_id)) {
      delete copy.asset;
    } else {
      copy.asset = setProperties(asset);
      copy.asset.id = asset._asset_id;
    }

    copy.port_count = parse_page_count(port_count);

    if (isDefined(result_count)) {
      copy.result_counts = {
        high: parse_page_count(result_count.hole),
        warning: parse_page_count(result_count.warning),
        info: parse_page_count(result_count.info),
        log: parse_page_count(result_count.log),
        false_positive: parse_page_count(result_count.false_positive),
        total: parse_page_count(result_count),
      };
    } else {
      copy.result_counts = {
        false_positive: 0,
        high: 0,
        info: 0,
        log: 0,
        warning: 0,
        total: 0,
      };
    }

    copy.start = parseDate(element.start);
    copy.end = parseDate(element.end);

    delete copy.result_count;

    copy.authSuccess = {};
    copy.details = {};

    if (isArray(element.detail)) {
      let appsCount = 0;
      element.detail.forEach(details => {
        const {name, value} = details;
        switch (name) {
          case 'hostname':
            copy.hostname = value;
            break;
          case 'best_os_cpe':
            copy.details.best_os_cpe = value;
            break;
          case 'best_os_txt':
            copy.details.best_os_txt = value;
            break;
          case 'traceroute':
            copy.details.distance = value.split(',').length - 1;
            break;
          case 'App':
            appsCount++;
            break;
          default:
            break;
        }
        if (name.startsWith('Auth')) {
          const authArray = name.split('-');
          copy.authSuccess[authArray[1].toLowerCase()] =
            authArray[2] === 'Success';
        }
        copy.details.appsCount = appsCount;
      });
    }

    delete copy.detail;

    copy.id = element.ip; // use ip as id. we need an id for react key prop

    return copy;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
