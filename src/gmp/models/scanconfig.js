/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';
import {forEach, map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';

import {parseInt, parseBoolean} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

export const EMPTY_SCAN_CONFIG_ID = '085569ce-73ed-11df-83c3-002264764cea';
export const FULL_AND_FAST_SCAN_CONFIG_ID =
  'daba56c8-73ec-11df-a475-002264764cea';
export const BASE_SCAN_CONFIG_ID = 'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663';

export const SCANCONFIG_TREND_DYNAMIC = 1;
export const SCANCONFIG_TREND_STATIC = 0;

export const parseCount = count => {
  return !isEmpty(count) && count !== '-1' ? parseInt(count) : undefined;
};

export const filterEmptyScanConfig = config =>
  config.id !== EMPTY_SCAN_CONFIG_ID;

export const parseTrend = parseInt;

class ScanConfig extends Model {
  static entityType = 'scanconfig';

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
        // number of selected nvts
        count: parseCount(ret.nvt_count.__text),
        trend: parseTrend(ret.nvt_count.growing),
      };

      delete ret.nvt_count;

      if (isDefined(ret.known_nvt_count)) {
        // number of known nvts by the scanner from last sync. should always be
        // equal or less then nvt_count because only the db may contain nvts not
        // known nvts by the scanner e.g. an imported scan config contains
        // private nvts
        ret.nvts.known = parseCount(ret.known_nvt_count);
        delete ret.known_nvt_count;
      }

      if (isDefined(ret.max_nvt_count)) {
        // sum of all available nvts of all selected families
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
      ret.tasks = map(element.tasks.task, task =>
        parseModelFromElement(task, 'task'),
      );
    } else {
      ret.tasks = [];
    }

    ret.predefined = parseBoolean(element.predefined);

    return ret;
  }
}

export default ScanConfig;

// vim: set ts=2 sw=2 tw=80:
