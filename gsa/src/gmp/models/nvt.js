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
import 'core-js/fn/string/starts-with';

import {isDefined, isArray, isString} from '../utils/identity';
import {isEmpty, split} from '../utils/string';
import {map} from '../utils/array';

import {parseFloat, parseSeverity} from '../parser';

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

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'nvt');

    ret.nvt_type = elem._type;

    ret.oid = ret._oid;
    ret.id = ret.oid;
    ret.tags = parse_tags(ret.tags);

    let refs = [];
    if (isDefined(ret.refs) && isArray(ret.refs.ref)) {
      refs = ret.refs.ref;
    } else if (isDefined(ret.refs) && isDefined(ret.refs.ref)) {
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

    ret.severity = parseSeverity(ret.cvss_base);
    delete ret.cvss_base;

    if (isDefined(ret.preferences)) {
      ret.preferences = map(ret.preferences.preference, preference => {
        const pref = {...preference};
        delete pref.nvt;
        return pref;
      });
    } else {
      ret.preferences = [];
    }

    if (isDefined(elem.qod)) {
      if (isEmpty(elem.qod.value)) {
        delete ret.qod.value;
      } else {
        ret.qod.value = parseFloat(elem.qod.value);
      }

      if (isEmpty(elem.qod.type)) {
        delete ret.qod.type;
      }
    }

    if (isEmpty(elem.default_timeout)) {
      delete ret.default_timeout;
    } else {
      ret.default_timeout = parseFloat(elem.default_timeout);
    }

    if (isEmpty(elem.timeout)) {
      delete ret.timeout;
    } else {
      ret.timeout = parseFloat(elem.timeout);
    }

    return ret;
  }
}

export default Nvt;

// vim: set ts=2 sw=2 tw=80:
