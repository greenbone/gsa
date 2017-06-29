/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {extend, is_defined, is_string, map, shallow_copy} from '../utils.js';

import Model from '../model.js';
import {parse_severity} from '../parser.js';

const parse_tags = tags => {
  let newtags = {};

  if (tags) {
    let splited = tags.split('|');
    for (let t of splited) {
      let [key, value] = t.split('=');
      newtags[key] = value;
    }
  }

  return newtags;
};

const parse_ids = (ids, no) => {
  if (is_string(ids) && ids !== no) {
    return ids.split(',').map(id => id.trim());
  }
  return [];
};

export class Nvt extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (elem.nvt) { // we have an info element
      extend(ret, elem.nvt);
      delete ret.nvt;
    }

    ret.oid = ret._oid;
    ret.tags = parse_tags(ret.tags);

    // several properties use different names in different responses
    // cve and cve_id, bid and bugtraq_id, cert and cert_ref

    ret.cves = parse_ids(ret.cve, 'NOCVE')
      .concat(parse_ids(ret.cve_id, 'NOCVE'));
    delete ret.cve;
    delete ret.cve_id;

    ret.bids = parse_ids(ret.bid, 'NOBID')
      .concat(parse_ids(ret.bugtraq_id, 'NOBID'));
    delete ret.bid;
    delete ret.bugtraq_id;

    ret.severity = parse_severity(ret.cvss_base);
    delete ret.cvss_base;

    if (is_defined(ret.preferences)) {
      ret.preferences = map(ret.preferences.preference, preference => {
        let pref = shallow_copy(preference);
        delete pref.nvt;
        return pref;
      });
    }
    else {
      ret.preferences = [];
    }

    if (is_defined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          id: ref._id,
          type: ref._type,
        };
      });

      delete ret.cert;
    }
    else {
      ret.certs = [];
    }

    if (is_defined(ret.cert_refs)) {
      ret.certs.concat(
        map(ret.cert_refs.cert_ref, ref => {
          return {
            id: ref._id,
            type: ref._type,
          };
        })
      );

      delete ret.cert_refs;
    }

    const xrefs = parse_ids(ret.xref, 'NOXREF');

    ret.xrefs = xrefs.map(xref => {
      let type = 'other';
      let ref = xref;
      if (xref.startsWith('URL:')) {
        type = 'URL';
        ref = xref.slice(4);
      }
      return {type, ref};
    });

    delete ret.xref;

    return ret;
  }
}

export default Nvt;

// vim: set ts=2 sw=2 tw=80:
