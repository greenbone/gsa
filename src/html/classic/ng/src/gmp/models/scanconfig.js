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

import {is_defined, is_empty, parse_int} from '../../utils.js';

import Model from '../model.js';

export const EMPTY_SCAN_CONFIG_ID = '085569ce-73ed-11df-83c3-002264764cea';
export const FULL_AND_FAST_SCAN_CONFIG_ID =
  'daba56c8-73ec-11df-a475-002264764cea';

export const OSP_SCAN_CONFIG_TYPE = 1;
export const OPENVAS_SCAN_CONFIG_TYPE = 0;

const parse_count = count => {
  return !is_empty(count) && count !== '-1' ? parse_int(count) : undefined;
};

export class ScanConfig extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);
    if (is_defined(ret.family_count)) {
      ret.families = {
        count: parse_count(ret.family_count.__text),
        trend: ret.family_count.growing,
      };
      delete ret.family_count;
    }
    else {
      ret.families = {};
    }

    if (is_defined(ret.nvt_count)) {
      ret.nvts = {
        count: parse_count(ret.nvt_count.__text),
        trend: ret.nvt_count.growing,
      };
      delete ret.nvt_count;
    }
    else {
      ret.nvts = {};
    }
    return ret;
  }
}

export default ScanConfig;

// vim: set ts=2 sw=2 tw=80:
