/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import moment from 'moment';

import {is_defined, is_empty, extend, map} from '../utils.js';

import {parse_severity, parse_yesno, YES_VALUE} from '../parser.js';

import Info from './info.js';

class Criteria {

  constructor(elem) {
    const {
      criterion: criterions,
      criteria: criterias,
      extend_definition: extend_definitions,
      _comment: comment,
      _operator: operator,
      _negate: negate,
    } = elem;

    this.criterions = map(criterions, criterion => ({
      applicability_check: criterion._applicability_check,
      comment: is_empty(criterion._comment) ? undefined : criterion._comment,
      negate: is_defined(criterion._negate) ?
        criterion._negate.toLowerCase() === 'true' : false,
      test_ref: criterion._test_ref,
    }));

    this.extend_definitions = map(extend_definitions, extend_definition => ({
      applicability_check: extend_definition._applicability_check,
      comment: is_empty(extend_definition._comment) ? undefined :
        extend_definition._comment,
      negate: is_defined(extend_definition._negate) ?
        extend_definition._negate.toLowerCase() === 'true' : false,
      definition_ref: extend_definition._definition_ref,
    }));

    this.criterias = map(criterias, criteria => new Criteria(criteria));

    if (is_defined(comment)) {
      this.comment = comment;
    }
    if (is_defined(operator)) {
      this.operator = operator;
    }

    this.negate = is_defined(negate) ? negate.toLowerCase() === 'true' : false;
  }
}

class Ovaldef extends Info {

  static info_type = 'ovaldef';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (elem.ovaldef) { // we have an info element
      extend(ret, elem.ovaldef);
      delete ret.ovaldef;
    }

    ret.severity = parse_severity(ret.max_cvss);
    delete ret.max_cvss;

    const {raw_data} = ret;

    if (is_defined(raw_data) && is_defined(raw_data.definition)) {
      const {definition} = raw_data;

      if (is_defined(definition._id)) {
        ret.short_id = definition._id;
      }
      if (is_defined(definition._version)) {
        ret.version = definition._version;
      }
      if (is_defined(definition._class)) {
        ret.class = definition._class;
      }
      if (is_defined(definition._depreacted)) {
        ret.deprecation = definition._depreacted;
      }

      if (is_defined(definition.metadata)) {
        const {metadata} = definition;

        ret.affecteds = map(metadata.affected, a => ({
          products: map(a.product, product => product),
          platforms: map(a.platform, platform => platform),
          family: a._family,
        }));

        ret.references = map(metadata.reference, ref => ({
          id: ref._ref_id,
          source: ref._source,
          type: is_defined(ref._source) ?
            ref._source.toLowerCase() : undefined,
          url: ref._ref_url,
        }));

        ret.repository = {
          status: metadata.oval_repository.status,
          changes: Object.entries(metadata.oval_repository.dates)
            .map(([key, value]) => ({
              name: key,
              date: moment(value._date),
              description: value.__text,
              contributors: map(value.contributor, contributor => ({
                name: contributor.__text,
                organization: contributor._organization,
              })),
            })),
        };

        delete metadata.reference;
      }
      else {
        ret.affecteds = [];
        ret.references = [];
      }

      ret.criterias = map(definition.criteria,
        criteria => new Criteria(criteria));
    }
    else {
      ret.affecteds = [];
      ret.references = [];
      ret.criterias = [];
    }

    delete ret.raw_data;

    ret.deprecated = parse_yesno(ret.deprecated);

    return ret;
  }

  isDeprecated() {
    return this.deprecated === YES_VALUE;
  }
}

export default Ovaldef;

// vim: set ts=2 sw=2 tw=80:
