/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseInt, parseBoolean, YesNo} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export const EMPTY_SCAN_CONFIG_ID = '085569ce-73ed-11df-83c3-002264764cea';
export const FULL_AND_FAST_SCAN_CONFIG_ID =
  'daba56c8-73ec-11df-a475-002264764cea';
export const BASE_SCAN_CONFIG_ID = 'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663';

export const SCANCONFIG_TREND_DYNAMIC = 1;
export const SCANCONFIG_TREND_STATIC = 0;

export const parseCount = (count: string | undefined) => {
  return !isEmpty(count) && count !== '-1' ? parseInt(count) : undefined;
};

export const filterEmptyScanConfig = (config: {id: string}) =>
  config.id !== EMPTY_SCAN_CONFIG_ID;

export const parseTrend = parseInt;

type ScanConfigPreferenceValue = string | number;

interface ScanConfigFamilyElement {
  name: string;
  growing?: number;
  nvt_count?: string;
  max_nvt_count?: string;
}

interface ScanConfigPreferenceElement {
  default?: ScanConfigPreferenceValue;
  id?: number;
  name?: string;
  hr_name?: string;
  nvt?: {
    name?: string;
    _oid?: string;
  };
  type?: string;
  value?: ScanConfigPreferenceValue;
}

interface ScannerElement extends ModelElement {
  __text: string;
}

interface ScanConfigElement extends ModelElement {
  deprecated?: YesNo;
  families?: {
    family: ScanConfigFamilyElement | ScanConfigFamilyElement[];
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
    preference?: ScanConfigPreferenceElement | ScanConfigPreferenceElement[];
  };
  scanner?: ScannerElement;
  tasks?: {
    task: ModelElement | ModelElement[];
  };
}

interface ScanConfigFamily {
  name: string;
  trend?: number;
  nvts?: {
    count?: number;
    max?: number;
  };
}

interface ScanConfigFamilies {
  count?: number;
  trend?: number;
  [name: string]: ScanConfigFamily | number | undefined;
}

interface ScanConfigPreference {
  default?: ScanConfigPreferenceValue;
  hr_name?: string;
  id?: number;
  name?: string;
  nvt?: {
    name?: string;
    oid?: string;
  };
  type?: string;
  value?: ScanConfigPreferenceValue;
}

interface ScanConfigNvts {
  count?: number;
  known?: number;
  max?: number;
  trend?: number;
}

interface ScanConfigProperties extends ModelProperties {
  deprecated?: boolean;
  family_list?: ScanConfigFamily[];
  families?: ScanConfigFamilies;
  nvts?: ScanConfigNvts;
  predefined?: boolean;
  preferences?: {
    nvt: ScanConfigPreference[];
    scanner: ScanConfigPreference[];
  };
  scanner?: Model;
  tasks?: Model[];
}

class ScanConfig extends Model {
  static readonly entityType = 'scanconfig';

  readonly deprecated?: boolean;
  readonly family_list?: ScanConfigFamily[];
  readonly families?: ScanConfigFamilies;
  readonly nvts?: ScanConfigNvts;
  readonly predefined?: boolean;
  readonly preferences?: {
    nvt: ScanConfigPreference[];
    scanner: ScanConfigPreference[];
  };
  readonly scanner?: Model;
  readonly tasks: Model[];

  constructor({
    deprecated,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_list = [],
    families,
    nvts,
    predefined,
    preferences,
    scanner,
    tasks = [],
    ...properties
  }: ScanConfigProperties = {}) {
    super(properties);

    this.deprecated = deprecated;
    this.family_list = family_list;
    this.families = families;
    this.nvts = nvts;
    this.predefined = predefined;
    this.preferences = preferences;
    this.scanner = scanner;
    this.tasks = tasks;
  }

  static fromElement(element?: ScanConfigElement): ScanConfig {
    return new ScanConfig(this.parseElement(element));
  }

  static parseElement(element: ScanConfigElement = {}): ScanConfigProperties {
    const ret = super.parseElement(element) as ScanConfigProperties;

    // for displaying the selected nvts (1 of 33) an object for accessing the
    // family by name is required
    const families: ScanConfigFamilies = {};

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
        // number of selected nvts
        count: parseCount(element.nvt_count.__text),
        trend: parseTrend(element.nvt_count.growing),
      };

      if (isDefined(element.known_nvt_count)) {
        // number of known nvts by the scanner from last sync. should always be
        // equal or less then nvt_count because only the db may contain nvts not
        // known nvts by the scanner e.g. an imported scan config contains
        // private nvts
        ret.nvts.known = parseCount(element.known_nvt_count);
      }

      if (isDefined(element.max_nvt_count)) {
        // sum of all available nvts of all selected families
        ret.nvts.max = parseCount(element.max_nvt_count);
      }
    }

    const nvtPreferences: ScanConfigPreference[] = [];
    const scannerPreferences: ScanConfigPreference[] = [];

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
      ret.preferences = {
        scanner: scannerPreferences,
        nvt: nvtPreferences,
      };
    }

    if (isDefined(element.scanner)) {
      const scanner = {
        ...element.scanner,
        name: element.scanner.__text,
      };
      ret.scanner = Model.fromElement(scanner, 'scanner');
    }

    ret.tasks = map(element.tasks?.task, task =>
      Model.fromElement(task, 'task'),
    );

    ret.predefined = isDefined(element.predefined)
      ? parseBoolean(element.predefined)
      : undefined;
    ret.deprecated = isDefined(element.deprecated)
      ? parseBoolean(element.deprecated)
      : undefined;

    return ret;
  }
}

export default ScanConfig;
