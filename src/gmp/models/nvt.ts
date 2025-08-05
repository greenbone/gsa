/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {
  parseDate,
  parseFloat,
  parseQod,
  parseSeverity,
  parseText,
  parseToString,
  parseYesNo,
  QoD,
  QoDParams,
  YES_VALUE,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isArray, isDefined, isString} from 'gmp/utils/identity';
import {isEmpty, split} from 'gmp/utils/string';

type Tags = Record<string, string | undefined>;

export interface NvtRefElement {
  _id: string;
  _type?: string;
}

interface SeverityElement {
  _type?: string;
  date?: string;
  origin?: string;
  score?: number;
  value?: string;
}

interface PreferenceElement {
  default?: string | number;
  hr_name?: string;
  id?: number;
  name?: string;
  nvt?: {
    _oid?: string;
    name?: string;
  };
  type?: string;
  value?: string | number;
}

interface EpssElement {
  cve?: {
    _id?: string;
    severity?: number;
  };
  percentile?: number;
  score?: number;
}

export interface NvtEpssElement {
  max_epss?: EpssElement;
  max_severity?: EpssElement;
}

export interface NvtSeveritiesElement {
  _score?: string;
  severity?: SeverityElement | SeverityElement[];
}

export interface NvtNvtElement {
  _oid?: string;
  category?: number;
  creation_time?: string;
  cvss_base?: number;
  default_timeout?: string | number;
  epss?: NvtEpssElement;
  family?: string;
  modification_time?: string;
  name?: string;
  preference_count?: number;
  preferences?: {
    default_timeout?: string;
    timeout?: string;
    preference?: PreferenceElement | PreferenceElement[];
  };
  qod?: QoDParams;
  refs?: {
    ref?: NvtRefElement | NvtRefElement[];
  };
  severities?: NvtSeveritiesElement;
  solution?: {
    __text?: string;
    _method?: string;
    _type?: string;
  };
  tags?: string;
  timeout?: string | number;
}

export interface NvtElement extends ModelElement {
  update_time?: string;
  nvt?: NvtNvtElement;
}

interface Preference {
  default?: string | number;
  hr_name?: string;
  id?: number;
  name?: string;
  type?: string;
  value?: string | number;
}

interface Reference {
  ref: string;
  type: string;
}

interface Cert {
  id: string;
  type: string;
}

interface Solution {
  type?: string;
  description?: string;
  method?: string;
}

interface EpssValue {
  percentile?: number;
  score?: number;
  cve?: {
    id?: string;
    severity?: number;
  };
}

interface Epss {
  maxEpss?: EpssValue;
  maxSeverity?: EpssValue;
}

interface NvtProperties extends ModelProperties {
  certs?: Cert[];
  cves?: string[];
  defaultTimeout?: number;
  epss?: Epss;
  family?: string;
  oid?: string;
  preferences?: Preference[];
  qod?: QoD;
  severity?: number;
  severityDate?: Date;
  severityOrigin?: string;
  solution?: Solution;
  tags?: Tags;
  timeout?: number;
  xrefs?: Reference[];
}

export const TAG_NA = 'N/A';

const parseTags = (tags?: string): Tags => {
  const newTags = {};

  if (tags) {
    const splitted = tags.split('|');
    for (const t of splitted) {
      const [key, value] = split(t, '=', 1);
      const newValue = isEmpty(value) ? undefined : value;
      newTags[key] = newValue;
    }
  }

  return newTags;
};

export const getRefs = (element?: {
  refs?: {
    ref?: NvtRefElement | NvtRefElement[];
  };
}) => map(element?.refs?.ref, ref => ref);

export const hasRefType = (refType: string) => (ref?: Partial<NvtRefElement>) =>
  isString(ref?._type) && ref._type.toLowerCase() === refType;

export const getFilteredRefIds = (refs: NvtRefElement[] = [], type: string) =>
  refs.filter(hasRefType(type)).map(ref => ref._id);

const getFilteredUrlRefs = (refs: NvtRefElement[]) => {
  return refs.filter(hasRefType('url')).map(ref => {
    let id = ref._id;
    if (
      !id.startsWith('http://') &&
      !id.startsWith('https://') &&
      !id.startsWith('ftp://') &&
      !id.startsWith('ftps://')
    ) {
      id = 'http://' + id;
    }
    return {
      ref: id,
      type: 'url',
    };
  });
};

const getFilteredRefs = (refs: NvtRefElement[], type: string) =>
  refs.filter(hasRefType(type)).map(ref => ({
    id: ref._id,
    type,
  }));

const getOtherRefs = (refs: NvtRefElement[]) => {
  const filteredRefs = refs.filter(ref => {
    const referenceType = isString(ref._type)
      ? ref._type.toLowerCase()
      : undefined;
    return (
      referenceType !== 'url' &&
      referenceType !== 'cve' &&
      referenceType !== 'cve_id' &&
      referenceType !== 'dfn-cert' &&
      referenceType !== 'cert-bund'
    );
  });
  const returnRefs = filteredRefs.map(ref => {
    return {
      ref: ref._id,
      type: isString(ref._type) ? ref._type.toLowerCase() : 'other',
    };
  });
  return returnRefs;
};

class Nvt extends Model {
  static entityType = 'nvt';

  readonly certs: Cert[];
  readonly cves: string[];
  readonly defaultTimeout?: number;
  readonly epss?: Epss;
  readonly family?: string;
  readonly oid?: string;
  readonly preferences: Preference[];
  readonly qod?: QoD;
  readonly severity?: number;
  readonly severityDate?: Date;
  readonly severityOrigin?: string;
  readonly solution?: Solution;
  readonly tags: Tags;
  readonly timeout?: number;
  readonly xrefs: Reference[];

  constructor({
    certs = [],
    cves = [],
    defaultTimeout,
    epss,
    family,
    oid,
    preferences = [],
    qod,
    severity,
    severityDate,
    severityOrigin,
    solution,
    tags = {},
    timeout,
    xrefs = [],
    ...other
  }: NvtProperties = {}) {
    super(other);

    this.certs = certs;
    this.cves = cves;
    this.defaultTimeout = defaultTimeout;
    this.epss = epss;
    this.family = family;
    this.oid = oid;
    this.preferences = preferences;
    this.qod = qod;
    this.severity = severity;
    this.severityDate = severityDate;
    this.severityOrigin = severityOrigin;
    this.solution = solution;
    this.tags = tags;
    this.timeout = timeout;
    this.xrefs = xrefs;
  }

  static fromElement(element: NvtElement = {}): Nvt {
    return new Nvt(this.parseElement(element));
  }

  static parseElement(element: NvtElement = {}): NvtProperties {
    const {nvt: nvtElement} = element;
    const ret = super.parseElement(element) as NvtProperties;

    ret.name = parseToString(nvtElement?.name) ?? ret.name;
    ret.oid = isEmpty(nvtElement?._oid) ? undefined : nvtElement?._oid;
    ret.id = ret.oid;
    ret.tags = parseTags(nvtElement?.tags);
    ret.family = isEmpty(nvtElement?.family)
      ? undefined
      : parseToString(nvtElement?.family);

    if (isDefined(nvtElement?.epss)) {
      ret.epss = {};

      if (isDefined(nvtElement?.epss?.max_epss)) {
        ret.epss.maxEpss = {
          percentile: parseFloat(nvtElement?.epss?.max_epss?.percentile),
          score: parseFloat(nvtElement?.epss?.max_epss?.score),
        };
        if (isDefined(nvtElement?.epss?.max_epss?.cve)) {
          ret.epss.maxEpss.cve = {
            id: nvtElement?.epss?.max_epss?.cve?._id,
            severity: parseFloat(nvtElement?.epss?.max_epss?.cve?.severity),
          };
        }
      }
      if (isDefined(nvtElement?.epss?.max_severity)) {
        ret.epss.maxSeverity = {
          percentile: parseFloat(nvtElement?.epss?.max_severity?.percentile),
          score: parseFloat(nvtElement?.epss?.max_severity?.score),
        };
        if (isDefined(nvtElement?.epss?.max_severity?.cve)) {
          ret.epss.maxSeverity.cve = {
            id: nvtElement?.epss?.max_severity?.cve?._id,
            severity: parseFloat(nvtElement?.epss?.max_severity?.cve?.severity),
          };
        }
      }
    }

    const refs = getRefs(nvtElement);

    ret.cves = getFilteredRefIds(refs, 'cve').concat(
      getFilteredRefIds(refs, 'cve_id'),
    );
    ret.certs = getFilteredRefs(refs, 'dfn-cert').concat(
      getFilteredRefs(refs, 'cert-bund'),
    );

    ret.xrefs = getFilteredUrlRefs(refs).concat(getOtherRefs(refs));

    if (isDefined(nvtElement?.severities?.severity)) {
      const severity = isArray(nvtElement.severities.severity)
        ? nvtElement.severities.severity[0]
        : nvtElement.severities.severity;
      ret.severity = parseSeverity(severity.score);
      ret.severityOrigin = parseText(severity.origin);
      ret.severityDate = parseDate(severity.date);
    } else {
      ret.severity = parseSeverity(nvtElement?.cvss_base);
    }

    if (isDefined(nvtElement?.solution)) {
      const solutionType = nvtElement.solution._type;
      const solutionText = nvtElement.solution.__text;
      const solutionMethod = nvtElement.solution._method;
      ret.solution = {
        type: isEmpty(solutionType) ? undefined : solutionType,
        description: isEmpty(solutionText) ? undefined : solutionText,
        method: isEmpty(solutionMethod) ? undefined : solutionMethod,
      };
    }

    if (isDefined(nvtElement?.preferences)) {
      ret.preferences = map(nvtElement.preferences?.preference, preference => {
        const pref = {...preference};
        delete pref.nvt;
        return pref;
      });
    } else {
      ret.preferences = [];
    }

    if (isDefined(nvtElement?.qod)) {
      ret.qod = parseQod(nvtElement.qod);
    }

    ret.defaultTimeout = isEmpty(nvtElement?.default_timeout as string)
      ? undefined
      : parseFloat(nvtElement?.default_timeout);

    ret.timeout = isEmpty(nvtElement?.timeout as string)
      ? undefined
      : parseFloat(nvtElement?.timeout);

    return ret;
  }

  isDeprecated() {
    return parseYesNo(this.tags.deprecated) === YES_VALUE;
  }
}

export default Nvt;
