/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';
import {forEach, map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';

import {parseInt, parseBoolean} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import {parseCount, parseTrend} from './scanconfig';

class Policy extends Model {
  static entityType = 'policy';

  static parseElement(element) {
    const ret = super.parseElement(element);

    // for displaying the selected nvts (1 of 33) an object for accessing the
    // family by name is required
    const families = {};

    if (isDefined(element.families)) {
      ret.family_list = map(element.families.family, family => {
        const {name} = family;
        const new_family = {
          name,
          trend: parseTrend(family.growing),
          nvts: {
            count: parseCount(family.nvt_count),
            max: parseCount(family.max_nvt_count),
          },
        };
        families[name] = new_family;
        return new_family;
      });
    } else {
      ret.family_list = [];
    }

    if (isDefined(ret.family_count)) {
      families.count = parseCount(ret.family_count.__text);
      families.trend = parseTrend(ret.family_count.growing);

      delete ret.family_count;
    } else {
      families.count = 0;
    }

    ret.families = families;

    if (isDefined(ret.nvt_count)) {
      ret.nvts = {
        count: parseCount(ret.nvt_count.__text),
        trend: parseTrend(ret.nvt_count.growing),
      };

      delete ret.nvt_count;

      if (isDefined(ret.known_nvt_count)) {
        ret.nvts.known = parseCount(ret.known_nvt_count);
        delete ret.known_nvt_count;
      }

      if (isDefined(ret.max_nvt_count)) {
        ret.nvts.max = parseCount(ret.max_nvt_count);
        delete ret.max_nvt_count;
      }
    } else {
      ret.nvts = {};
    }

    const nvt_preferences = [];
    const scanner_preferences = [];

    if (isDefined(element.preferences)) {
      forEach(element.preferences.preference, preference => {
        const pref = {...preference};
        if (isEmpty(pref.nvt.name)) {
          delete pref.nvt;

          scanner_preferences.push(pref);
        } else {
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

    ret.policy_type = parseInt(element.type);

    if (isDefined(element.scanner)) {
      const scanner = {
        ...element.scanner,
        name: element.scanner.__text,
      };
      ret.scanner = parseModelFromElement(scanner, 'scanner');
    }

    if (isDefined(element.tasks)) {
      ret.audits = map(element.tasks.task, task =>
        parseModelFromElement(task, 'audit'),
      );
    } else {
      ret.audits = [];
    }

    ret.predefined = parseBoolean(element.predefined);

    return ret;
  }
}

export default Policy;

// vim: set ts=2 sw=2 tw=80:
