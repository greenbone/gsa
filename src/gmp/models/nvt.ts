/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {
  parseDate,
  parseFloat,
  parseSeverity,
  parseText,
  parseYesNo,
  YES_VALUE,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty, split} from 'gmp/utils/string';

export const TAG_NA = 'N/A';

type Tags = Record<string, string | undefined>;

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
    ref?: RefElement | RefElement[];
  };
}) => map(element?.refs?.ref, ref => ref);

export const hasRefType = (refType: string) => (ref?: Partial<RefElement>) =>
  isString(ref?._type) && ref._type.toLowerCase() === refType;

export const getFilteredRefIds = (refs: RefElement[] = [], type: string) =>
  refs.filter(hasRefType(type)).map(ref => ref._id);

const getFilteredUrlRefs = (refs: RefElement[]) => {
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

const getFilteredRefs = (refs: RefElement[], type: string) =>
  refs.filter(hasRefType(type)).map(ref => ({
    id: ref._id,
    type,
  }));

const getOtherRefs = (refs: RefElement[]) => {
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

interface RefElement {
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

interface NvtElement extends ModelElement {
  update_time?: string;
  nvt?: {
    _oid?: string;
    category?: number;
    creation_time?: string;
    cvss_base?: number;
    default_timeout?: string | number;
    epss?: {
      max_epss?: {
        cve?: {
          _id?: string;
          severity?: number;
        };
        percentile?: number;
        score?: number;
      };
      max_severity?: {
        cve?: {
          _id?: string;
          severity?: number;
        };
        percentile?: number;
        score?: number;
      };
    };
    family?: string;
    modification_time?: string;
    name?: string;
    preference_count?: number;
    preferences?: {
      default_timeout?: string;
      timeout?: string;
      preference?: PreferenceElement | PreferenceElement[];
    };
    qod?: {
      type?: string;
      value?: string | number;
    };
    refs?: {
      ref?: RefElement | RefElement[];
    };
    severities?: {
      _score?: number;
      severity?: SeverityElement;
    };
    solution?: {
      __text?: string;
      _method?: string;
      _type?: string;
    };
    tags?: string;
    timeout?: string | number;
  };
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

interface QoD {
  type?: string;
  value?: number;
}

interface NvtProperties extends ModelProperties {
  certs?: Cert[];
  cves?: string[];
  defaultTimeout?: number;
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

class Nvt extends Model {
  static entityType = 'nvt';

  readonly certs: Cert[];
  readonly cves: string[];
  readonly defaultTimeout?: number;
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

    ret.oid = isEmpty(nvtElement?._oid) ? undefined : nvtElement?._oid;
    ret.id = ret.oid;
    ret.tags = parseTags(nvtElement?.tags);

    const refs = getRefs(nvtElement);

    ret.cves = getFilteredRefIds(refs, 'cve').concat(
      getFilteredRefIds(refs, 'cve_id'),
    );
    ret.certs = getFilteredRefs(refs, 'dfn-cert').concat(
      getFilteredRefs(refs, 'cert-bund'),
    );

    ret.xrefs = getFilteredUrlRefs(refs).concat(getOtherRefs(refs));

    if (isDefined(nvtElement?.severities?.severity)) {
      const {severity} = nvtElement.severities;
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
      ret.qod = {
        type: isEmpty(nvtElement.qod.type) ? undefined : nvtElement.qod.type,
        value: isEmpty(nvtElement.qod.value as string)
          ? undefined
          : parseFloat(nvtElement.qod.value),
      };
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
