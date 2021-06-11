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

import Model, {parseModelFromElement, parseModelFromObject} from 'gmp/model';

import {parseInt, parseBoolean} from 'gmp/parser';

import {forEach, map} from 'gmp/utils/array';
import {hasValue, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {
  parseCount,
  parseTrend,
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from './scanconfig';

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
          pref.nvt.id = preference.nvt._oid;
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

  static parseObject(object) {
    const ret = super.parseObject(object);

    if (hasValue(object.type)) {
      ret.policyType = object.type;
    }

    const families = {};

    if (hasValue(object.families)) {
      ret.familyList = map(object.families, family => {
        const {name} = family;
        const newFamily = {
          name,
          trend:
            hasValue(family) && family.growing
              ? SCANCONFIG_TREND_DYNAMIC
              : SCANCONFIG_TREND_STATIC,
          nvts: {
            count:
              hasValue(family.nvtCount) && family.nvtCount !== -1
                ? family.nvtCount
                : undefined,
            max:
              hasValue(family.maxNvtCount) && family.maxNvtCount !== -1
                ? family.maxNvtCount
                : undefined,
          },
        };
        families[name] = newFamily;
        return newFamily;
      });
    } else {
      ret.familyList = [];
    }

    if (hasValue(ret.familyCount)) {
      families.count = ret.familyCount;

      delete ret.familyCount;
    } else {
      families.count = 0;
    }

    ret.families = families;

    ret.nvts = {};

    if (hasValue(ret.nvtCount)) {
      ret.nvts = {
        // number of selected nvts
        count: ret.nvtCount,
      };

      delete ret.nvtCount;

      if (isDefined(ret.knownNvtCount)) {
        // number of known nvts by the scanner from last sync. should always be
        // equal or less then nvt_count because only the db may contain nvts not
        // known nvts by the scanner e.g. an imported scan config contains
        // private nvts
        ret.nvts.known = ret.knownNvtCount;
        delete ret.knownNvtCount;
      }

      if (isDefined(ret.maxNvtCount)) {
        // sum of all available nvts of all selected families
        ret.nvts.max = ret.maxNvtCount;
        delete ret.maxNvtCount;
      }
    }

    if (hasValue(ret.familyGrowing)) {
      families.trend = ret.familyGrowing
        ? SCANCONFIG_TREND_DYNAMIC
        : SCANCONFIG_TREND_STATIC;
    }

    if (hasValue(ret.nvtGrowing)) {
      ret.nvts.trend = ret.nvtGrowing
        ? SCANCONFIG_TREND_DYNAMIC
        : SCANCONFIG_TREND_STATIC;
    }

    if (!hasValue(ret.nvtPreferences)) {
      ret.nvtPreferences = [];
    }

    if (!hasValue(ret.scannerPreferences)) {
      ret.scannerPreferences = [];
    }

    ret.preferences = {
      scanner: ret.scannerPreferences,
      nvt: ret.nvtPreferences,
    };

    if (hasValue(object.audits)) {
      ret.audits = map(object.audits, audit =>
        parseModelFromObject(audit, 'audit'),
      );
    } else {
      ret.audits = [];
    }

    return ret;
  }
}

export default Policy;

// vim: set ts=2 sw=2 tw=80:
