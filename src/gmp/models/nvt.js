/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseDate,
  parseFloat,
  parseSeverity,
  parseText,
  parseYesNo,
  YES_VALUE,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isArray, isString} from 'gmp/utils/identity';
import {isEmpty, split} from 'gmp/utils/string';

import Info from './info';

export const TAG_NA = 'N/A';

const parseTags = tags => {
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

export const getRefs = element => {
  if (
    !isDefined(element) ||
    !isDefined(element.refs) ||
    !isDefined(element.refs.ref)
  ) {
    return [];
  }
  if (isArray(element.refs.ref)) {
    return element.refs.ref;
  }
  return [element.refs.ref];
};

export const hasRefType =
  refType =>
  (ref = {}) =>
    isString(ref._type) && ref._type.toLowerCase() === refType;

export const getFilteredRefIds = (refs = [], type) => {
  const filteredRefs = refs.filter(hasRefType(type));
  return filteredRefs.map(ref => ref._id);
};

const getFilteredUrlRefs = refs => {
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

const getFilteredRefs = (refs, type) =>
  refs.filter(hasRefType(type)).map(ref => ({
    id: ref._id,
    type,
  }));

const getOtherRefs = refs => {
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

class Nvt extends Info {
  static entityType = 'nvt';

  static parseElement(element) {
    const ret = super.parseElement(element, 'nvt');

    ret.nvtType = ret._type;

    ret.oid = isEmpty(ret._oid) ? undefined : ret._oid;
    ret.id = ret.oid;
    ret.tags = parseTags(ret.tags);

    const refs = getRefs(ret);

    ret.cves = getFilteredRefIds(refs, 'cve').concat(
      getFilteredRefIds(refs, 'cve_id'),
    );
    ret.certs = getFilteredRefs(refs, 'dfn-cert').concat(
      getFilteredRefs(refs, 'cert-bund'),
    );

    ret.xrefs = getFilteredUrlRefs(refs, 'url').concat(getOtherRefs(refs));

    delete ret.refs;

    if (isDefined(ret?.severities?.severity)) {
      const {severity} = ret.severities;
      ret.severity = parseSeverity(severity.score);
      ret.severityOrigin = parseText(severity.origin);
      ret.severityDate = parseDate(severity.date);
    } else {
      ret.severity = parseSeverity(ret.cvss_base);
    }
    delete ret.cvss_base;

    if (isDefined(ret.solution)) {
      const solutionType = ret.solution._type;
      const solutionText = ret.solution.__text;
      const solutionMethod = ret.solution._method;
      ret.solution = {
        type: isEmpty(solutionType) ? undefined : solutionType,
        description: isEmpty(solutionText) ? undefined : solutionText,
        method: isEmpty(solutionMethod) ? undefined : solutionMethod,
      };
    }

    if (isDefined(ret.preferences)) {
      ret.preferences = map(ret.preferences.preference, preference => {
        const pref = {...preference};
        delete pref.nvt;
        return pref;
      });
    } else {
      ret.preferences = [];
    }

    if (isDefined(ret.qod)) {
      if (isEmpty(ret.qod.value)) {
        delete ret.qod.value;
      } else {
        ret.qod.value = parseFloat(ret.qod.value);
      }

      if (isEmpty(ret.qod.type)) {
        delete ret.qod.type;
      }
    }

    if (isEmpty(ret.default_timeout)) {
      delete ret.default_timeout;
    } else {
      ret.defaultTimeout = parseFloat(ret.default_timeout);
      delete ret.default_timeout;
    }

    if (isEmpty(ret.timeout)) {
      delete ret.timeout;
    } else {
      ret.timeout = parseFloat(ret.timeout);
    }

    return ret;
  }

  isDeprecated() {
    return parseYesNo(this.tags.deprecated) === YES_VALUE;
  }
}

export default Nvt;
