/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
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
  YES_VALUE,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isArray, isDefined, isString} from 'gmp/utils/identity';
import {isEmpty, split} from 'gmp/utils/string';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

type Tags = Record<string, string | undefined>;

// Inferred types
export type NvtRefElement = z.infer<typeof NvtRefElementSchema>;
export type NvtEpssElement = z.infer<typeof NvtEpssElementSchema>;
export type NvtSeveritiesElement = z.infer<typeof NvtSeveritiesElementSchema>;
export type NvtNvtElement = z.infer<typeof NvtNvtElementSchema>;
export type NvtElement = z.infer<typeof NvtElementSchema> & ModelElement;
type Preference = z.infer<typeof PreferenceSchema>;
type Reference = z.infer<typeof ReferenceSchema>;
type Cert = z.infer<typeof CertSchema>;
type Solution = z.infer<typeof SolutionSchema>;
type Epss = z.infer<typeof EpssSchema>;
type NvtProperties = z.infer<typeof NvtSchema> & ModelProperties;

// Zod schemas for element types
const NvtRefElementSchema = z.object({
  _id: z.string(),
  _type: z.string().optional(),
});

const SeverityElementSchema = z.object({
  _type: z.string().optional(),
  date: z.string().optional(),
  origin: z.string().optional(),
  score: z.number().optional(),
  value: z.string().optional(),
});

const PreferenceElementSchema = z.object({
  default: z.union([z.string(), z.number()]).optional(),
  hr_name: z.string().optional(),
  id: z.number().optional(),
  name: z.string().optional(),
  nvt: z
    .object({
      _oid: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  type: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

const EpssElementSchema = z.object({
  cve: z
    .object({
      _id: z.string().optional(),
      severity: z.number().optional(),
    })
    .optional(),
  percentile: z.number().optional(),
  score: z.number().optional(),
});

const NvtEpssElementSchema = z.object({
  max_epss: EpssElementSchema.optional(),
  max_severity: EpssElementSchema.optional(),
});

const NvtSeveritiesElementSchema = z.object({
  _score: z.string().optional(),
  severity: z
    .union([SeverityElementSchema, z.array(SeverityElementSchema)])
    .optional(),
});

const NvtNvtElementSchema = z.object({
  _oid: z.string().optional(),
  category: z.number().optional(),
  creation_time: z.string().optional(),
  cvss_base: z.number().optional(),
  default_timeout: z.union([z.string(), z.number()]).optional(),
  epss: NvtEpssElementSchema.optional(),
  family: z.string().optional(),
  modification_time: z.string().optional(),
  name: z.string().optional(),
  preference_count: z.number().optional(),
  preferences: z
    .object({
      default_timeout: z.string().optional(),
      timeout: z.string().optional(),
      preference: z
        .union([PreferenceElementSchema, z.array(PreferenceElementSchema)])
        .optional(),
    })
    .optional(),
  qod: z.any().optional(), // QoDParams type
  refs: z
    .object({
      ref: z
        .union([NvtRefElementSchema, z.array(NvtRefElementSchema)])
        .optional(),
    })
    .optional(),
  severities: NvtSeveritiesElementSchema.optional(),
  solution: z
    .object({
      __text: z.string().optional(),
      _method: z.string().optional(),
      _type: z.string().optional(),
    })
    .optional(),
  tags: z.string().optional(),
  timeout: z.union([z.string(), z.number()]).optional(),
});

export const NvtElementSchema = z
  .object({
    update_time: z.string().optional(),
    nvt: NvtNvtElementSchema.optional(),
  })
  .and(z.any()); // ModelElement

// Zod schemas for processed types
const PreferenceSchema = z.object({
  default: z.union([z.string(), z.number()]).optional(),
  hr_name: z.string().optional(),
  id: z.number().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

const ReferenceSchema = z.object({
  ref: z.string(),
  type: z.string(),
});

const CertSchema = z.object({
  id: z.string(),
  type: z.string(),
});

const SolutionSchema = z.object({
  type: z.string().optional(),
  description: z.string().optional(),
  method: z.string().optional(),
});

const EpssValueSchema = z.object({
  percentile: z.number().optional(),
  score: z.number().optional(),
  cve: z
    .object({
      id: z.string().optional(),
      severity: z.number().optional(),
    })
    .optional(),
});

const EpssSchema = z.object({
  maxEpss: EpssValueSchema.optional(),
  maxSeverity: EpssValueSchema.optional(),
});

export const NvtSchema = z.object({
  certs: z.array(CertSchema).optional(),
  cves: z.array(z.string()).optional(),
  defaultTimeout: z.number().optional(),
  epss: EpssSchema.optional(),
  family: z.string().optional(),
  oid: z.string().optional(),
  preferences: z.array(PreferenceSchema).optional(),
  qod: z.any().optional(), // QoD type
  severity: z.number().optional(),
  severityDate: z.any().optional(), // Date type
  severityOrigin: z.string().optional(),
  solution: SolutionSchema.optional(),
  tags: z.record(z.string(), z.string().optional()).optional(),
  timeout: z.number().optional(),
  xrefs: z.array(ReferenceSchema).optional(),
});

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
    const parsedElement = this.parseElement(element);

    return validateAndCreate({
      schema: NvtSchema,
      parsedElement,
      originalElement: element,
      modelName: 'nvt',
      ModelClass: Nvt,
    });
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
