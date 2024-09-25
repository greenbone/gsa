/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {forEach, map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';

import {parseBoolean} from 'gmp/parser';

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
