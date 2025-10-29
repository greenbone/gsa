/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {
  parseCount,
  parseTrend,
  type ScanConfigFamilies,
  type ScanConfigFamily,
  type ScanConfigFamilyElement,
  type ScanConfigNvts,
  type ScanConfigPreferenceElement,
  type ScanConfigScannerElement,
} from 'gmp/models/scanconfig';
import {parseBoolean, type YesNo} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

type PolicyFamilyElement = ScanConfigFamilyElement;
type PolicyPreferenceElement = ScanConfigPreferenceElement;

interface PolicyElement extends ModelElement {
  families?: {
    family: PolicyFamilyElement | PolicyFamilyElement[];
  };
  family_count?: {
    __text: string;
    growing?: YesNo;
  };
  known_nvt_count?: string;
  max_nvt_count?: string;
  nvt_count?: {
    __text: string;
    growing?: YesNo;
  };
  predefined?: YesNo;
  preferences?: {
    preference: PolicyPreferenceElement | PolicyPreferenceElement[];
  };
  scanner?: ScanConfigScannerElement;
  tasks?: {
    task: ModelElement | ModelElement[];
  };
}

type PolicyFamily = ScanConfigFamily;
type PolicyFamilies = ScanConfigFamilies;
type PolicyNvts = ScanConfigNvts;
type PolicyPreference = ScanConfigPreferenceElement;

interface PolicyPreferences {
  nvt: PolicyPreference[];
  scanner: PolicyPreference[];
}

interface PolicyProperties extends ModelProperties {
  families?: PolicyFamilies;
  family_list?: PolicyFamily[];
  nvts?: PolicyNvts;
  predefined?: boolean;
  preferences?: PolicyPreferences;
  scanner?: Model;
  audits?: Model[];
}

class Policy extends Model {
  static readonly entityType = 'policy';

  readonly families?: PolicyFamilies;
  readonly family_list: PolicyFamily[];
  readonly nvts?: PolicyNvts;
  readonly predefined?: boolean;
  readonly preferences: PolicyPreferences;
  readonly scanner?: Model;
  readonly audits: Model[];

  constructor({
    families,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_list = [],
    nvts,
    predefined,
    preferences = {nvt: [], scanner: []},
    scanner,
    audits = [],
    ...properties
  }: PolicyProperties = {}) {
    super(properties);

    this.families = families;
    this.family_list = family_list;
    this.nvts = nvts;
    this.predefined = predefined;
    this.preferences = preferences;
    this.scanner = scanner;
    this.audits = audits;
  }

  static fromElement(element: PolicyElement = {}): Policy {
    return new Policy(this.parseElement(element));
  }

  static parseElement(element: PolicyElement = {}): PolicyProperties {
    const ret = super.parseElement(element) as PolicyProperties;

    // for displaying the selected nvts (1 of 33) an object for accessing the
    // family by name is required
    const families: PolicyFamilies = {};

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

    if (isDefined(element.family_count)) {
      families.count = parseCount(element.family_count.__text);
      families.trend = parseTrend(element.family_count.growing);
    } else {
      families.count = 0;
    }

    ret.families = families;

    if (isDefined(element.nvt_count)) {
      ret.nvts = {
        count: parseCount(element.nvt_count.__text),
        trend: parseTrend(element.nvt_count.growing),
      };

      if (isDefined(element.known_nvt_count)) {
        ret.nvts.known = parseCount(element.known_nvt_count);
      }

      if (isDefined(element.max_nvt_count)) {
        ret.nvts.max = parseCount(element.max_nvt_count);
      }
    }

    const nvtPreferences: PolicyPreference[] = [];
    const scannerPreferences: PolicyPreference[] = [];

    if (isDefined(element.preferences)) {
      forEach(element.preferences.preference, preference => {
        const pref = {...preference};
        if (isEmpty(pref.nvt?.name)) {
          delete pref.nvt;

          scannerPreferences.push(pref);
        } else {
          const nvt = {...pref.nvt, oid: pref.nvt?._oid};
          pref.nvt = nvt;
          delete pref.nvt._oid;

          nvtPreferences.push(pref);
        }
      });
    }
    ret.preferences = {
      scanner: scannerPreferences,
      nvt: nvtPreferences,
    };

    if (isDefined(element.scanner)) {
      const scanner = {
        ...element.scanner,
        name: element.scanner.__text,
      };
      ret.scanner = Model.fromElement(scanner, 'scanner');
    }

    ret.audits = map(element.tasks?.task, task =>
      Model.fromElement(task, 'audit'),
    );

    ret.predefined = isDefined(element.predefined)
      ? parseBoolean(element.predefined)
      : undefined;

    return ret;
  }
}

export default Policy;
