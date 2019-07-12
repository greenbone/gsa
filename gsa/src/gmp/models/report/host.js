/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
  constructor(elem) {
    this.parseProperties(elem);
  }

  parseProperties(elem) {
    const copy = {...elem};

    const {asset = {}, port_count = {}, result_count} = elem;

    if (isEmpty(asset._asset_id)) {
      delete copy.asset;
    } else {
      copy.asset = setProperties(asset);
      copy.asset.id = asset._asset_id;
    }

    copy.port_count = parse_page_count(port_count.page);

    if (isDefined(result_count)) {
      copy.result_counts = {
        hole: parse_page_count(result_count.hole),
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

    copy.start = parseDate(elem.start);
    copy.end = parseDate(elem.end);

    delete copy.result_count;

    copy.authSuccess = {};
    copy.details = {};

    if (isArray(elem.detail)) {
      let appsCount = 0;
      elem.detail.forEach(details => {
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

    copy.id = elem.ip; // use ip as id. we need an id for react key prop

    setProperties(copy, this);

    return this;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
