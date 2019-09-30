/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/features/string/starts-with';

import {isDefined, isArray, isString} from 'gmp/utils/identity';
import {isEmpty, split} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import {parseFloat, parseSeverity} from 'gmp/parser';

import Info from './info';

export const TAG_NA = 'N/A';

const parse_tags = tags => {
  const newtags = {};

  if (tags) {
    const splited = tags.split('|');
    for (const t of splited) {
      const [key, value] = split(t, '=', 1);
      newtags[key] = value;
    }
  }

  return newtags;
};

const getFilteredRefIds = (refs, type) => {
  const filteredRefs = refs.filter(ref => ref._type === type);
  return filteredRefs.map(ref => ref._id);
};

const getFilteredRefs = (refs, type) => {
  const filteredRefs = refs.filter(ref => {
    const rtype = isString(ref._type) ? ref._type.toLowerCase() : undefined;
    return rtype === type;
  });
  const returnRefs = filteredRefs.map(ref => {
    let id = ref._id;
    if (type === 'url') {
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
        type: type,
      };
    }
    return {
      id: id,
      type: type,
    };
  });
  return returnRefs;
};

const getOtherRefs = refs => {
  const filteredRefs = refs.filter(ref => {
    const rtype = isString(ref._type) ? ref._type.toLowerCase() : undefined;
    return (
      rtype !== 'url' &&
      rtype !== 'cve' &&
      rtype !== 'cve_id' &&
      rtype !== 'bid' &&
      rtype !== 'bugtraq_id' &&
      rtype !== 'dfn-cert' &&
      rtype !== 'cert-bund'
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

    ret.nvt_type = element._type;

    ret.oid = isEmpty(ret._oid) ? undefined : ret._oid;
    ret.id = ret.oid;
    ret.tags = parse_tags(element.tags);

    let refs = [];
    if (isDefined(element.refs) && isArray(element.refs.ref)) {
      refs = ret.refs.ref;
    } else if (isDefined(element.refs) && isDefined(element.refs.ref)) {
      refs = [ret.refs.ref];
    }

    ret.cves = getFilteredRefIds(refs, 'cve').concat(
      getFilteredRefIds(refs, 'cve_id'),
    );
    ret.bids = getFilteredRefIds(refs, 'bid').concat(
      getFilteredRefIds(refs, 'bugtraq_id'),
    );

    ret.certs = getFilteredRefs(refs, 'dfn-cert').concat(
      getFilteredRefs(refs, 'cert-bund'),
    );

    ret.xrefs = getFilteredRefs(refs, 'url').concat(getOtherRefs(refs));

    delete ret.refs;

    ret.severity = parseSeverity(element.cvss_base);
    delete ret.cvss_base;

    if (isDefined(element.preferences)) {
      ret.preferences = map(ret.preferences.preference, preference => {
        const pref = {...preference};
        delete pref.nvt;
        return pref;
      });
    } else {
      ret.preferences = [];
    }

    if (isDefined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          id: ref._id,
          type: ref._type,
        };
      });

      delete ret.cert;
    } else {
      ret.certs = [];
    }

    if (isDefined(ret.cert_refs)) {
      const crefs = map(ret.cert_refs.cert_ref, ref => {
        return {
          id: ref._id,
          type: ref._type,
        };
      });
      ret.certs = [...ret.certs, ...crefs];
      delete ret.cert_refs;
    }

    const xrefs = parse_ids(ret.xrefs, 'NOXREF');

    ret.xrefs = xrefs.map(xref => {
      let type = 'other';
      let ref = xref;
      if (xref.startsWith('URL:')) {
        type = 'URL';
        ref = xref.slice(4);
        if (
          !ref.startsWith('http://') &&
          !ref.startsWith('https://') &&
          !ref.startsWith('ftp://') &&
          !ref.startsWith('ftps://')
        ) {
          ref = 'http://' + ref;
        }
      }
      return {type, ref};
    });

    delete ret.xref;

    if (isDefined(element.qod)) {
      if (isEmpty(element.qod.value)) {
        delete ret.qod.value;
      } else {
        ret.qod.value = parseFloat(element.qod.value);
      }

      if (isEmpty(element.qod.type)) {
        delete ret.qod.type;
      }
    }

    if (isEmpty(element.default_timeout)) {
      delete ret.default_timeout;
    } else {
      ret.default_timeout = parseFloat(element.default_timeout);
    }

    if (isEmpty(element.timeout)) {
      delete ret.timeout;
    } else {
      ret.timeout = parseFloat(element.timeout);
    }

    return ret;
  }
}

export default Nvt;

// vim: set ts=2 sw=2 tw=80:
