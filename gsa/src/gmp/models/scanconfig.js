/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {is_defined} from '../utils/identity';
import {
  for_each,
  map,
} from '../utils/array';
import {is_empty} from '../utils/string';

import {parse_int} from '../parser.js';

import Model from '../model.js';

export const EMPTY_SCAN_CONFIG_ID = '085569ce-73ed-11df-83c3-002264764cea';
export const FULL_AND_FAST_SCAN_CONFIG_ID =
  'daba56c8-73ec-11df-a475-002264764cea';

export const OSP_SCAN_CONFIG_TYPE = 1;
export const OPENVAS_SCAN_CONFIG_TYPE = 0;

export const parse_count = count => {
  return !is_empty(count) && count !== '-1' ? parse_int(count) : undefined;
};

class ScanConfig extends Model {

  static entity_type = 'config'; // TODO should be scan_config in future

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    // for displaying the selected nvts (1 of 33) an object for accessing the
    // family by name is required
    const families = {};

    if (is_defined(elem.families)) {
      ret.family_list = map(elem.families.family, family => {
        const {name} = family;
        const new_family = {
          name,
          trend: family.growing,
          nvts: {
            count: parse_count(family.nvt_count),
            max: parse_count(family.max_nvt_count),
          },
        };
        families[name] = new_family;
        return new_family;
      });
    }
    else {
      ret.family_list = [];
    }

    if (is_defined(ret.family_count)) {
      families.count = parse_count(ret.family_count.__text);
      families.trend = ret.family_count.growing;

      delete ret.family_count;
    }
    else {
      families.count = 0;
    }

    ret.families = families;

    if (is_defined(ret.nvt_count)) {
      ret.nvts = {
        count: parse_count(ret.nvt_count.__text),
        trend: ret.nvt_count.growing,
      };

      delete ret.nvt_count;

      if (is_defined(ret.known_nvt_count)) {
        ret.nvts.known = parse_count(ret.known_nvt_count);
        delete ret.known_nvt_count;
      }

      if (is_defined(ret.max_nvt_count)) {
        ret.nvts.max = parse_count(ret.max_nvt_count);
        delete ret.max_nvt_count;
      }
    }
    else {
      ret.nvts = {};
    }

    const nvt_preferences = [];
    const scanner_preferences = [];

    if (is_defined(elem.preferences)) {
      for_each(elem.preferences.preference, preference => {
        const pref = {...preference};
        if (is_empty(pref.nvt.name)) {
          delete pref.nvt;

          scanner_preferences.push(pref);
        }
        else {
          const nvt = {...pref.nvt};
          pref.nvt = nvt;
          pref.nvt.oid = preference.nvt._oid;
          delete pref.nvt._oid;

          nvt_preferences.push(pref);
        }
      });
    }

    ret.preferences = {
      scanner: scanner_preferences,
      nvt: nvt_preferences,
    };

    ret.scan_config_type = parse_int(elem.type);

    if (is_defined(elem.scanner)) {
      const scanner = {
        ...elem.scanner,
        name: elem.scanner.__text,
      };
      ret.scanner = new Model(scanner, 'scanner');
    }

    if (is_defined(elem.tasks)) {
      ret.tasks = map(elem.tasks.task, task => new Model(task, 'task'));
    }
    else {
      ret.tasks = [];
    }

    return ret;
  }
}

export default ScanConfig;

// vim: set ts=2 sw=2 tw=80:
