/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_array, is_defined, is_empty} from 'gmp/utils.js';

import {set_properties, parse_int} from 'gmp/parser.js';

const parse_count = value => {
  const parsed = parse_int(value);

  if (is_defined(parsed)) {
    return parsed;
  }

  return 0;
};

const parse_page_count = value => {
  if (is_defined(value)) {
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

    if (is_empty(asset._asset_id)) {
      delete copy.asset;
    }
    else {
      copy.asset = set_properties(asset);
      copy.asset.id = asset._asset_id;
    }

    copy.port_count = parse_page_count(port_count.page);

    if (is_defined(result_count)) {
      copy.result_counts = {
        hole: parse_page_count(result_count.hole),
        warning: parse_page_count(result_count.warning),
        info: parse_page_count(result_count.info),
        log: parse_page_count(result_count.log),
        false_positive: parse_page_count(result_count.false_positive),
        total: parse_page_count(result_count),
      };
    }
    else {
      copy.result_counts = {
        false_positive: 0,
        high: 0,
        info: 0,
        log: 0,
        warning: 0,
        total: 0,
      };
    }

    copy.start = moment(elem.start);
    copy.end = moment(elem.end);

    delete copy.result_count;

    copy.details = {};

    if (is_array(elem.detail)) {
      elem.detail.forEach(details => {
        switch (details.name) {
          case 'hostname':
            copy.hostname = details.value;
            break;
          case 'best_os_cpe':
            copy.details.best_os_cpe = details.value;
            break;
          case 'best_os_txt':
            copy.details.best_os_txt = details.value;
            break;
          default:
            break;
        }
      });
    }

    delete copy.detail;

    copy.id = elem.ip; // use ip as id. we need an id for react key prop

    set_properties(copy, this);

    return this;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
