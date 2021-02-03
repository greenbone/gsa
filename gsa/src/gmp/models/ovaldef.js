/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseSeverity, parseYesNo, YES_VALUE, parseDate} from 'gmp/parser';

import Info from './info';

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
      applicabilityCheck: criterion._applicability_check,
      comment: isEmpty(criterion._comment) ? undefined : criterion._comment,
      negate: isDefined(criterion._negate)
        ? criterion._negate.toLowerCase() === 'true'
        : false,
      testRef: criterion._test_ref,
    }));

    this.extendDefinitions = map(extend_definitions, extend_definition => ({
      applicabilityCheck: extend_definition._applicability_check,
      comment: isEmpty(extend_definition._comment)
        ? undefined
        : extend_definition._comment,
      negate: isDefined(extend_definition._negate)
        ? extend_definition._negate.toLowerCase() === 'true'
        : false,
      definitionRef: extend_definition._definition_ref,
    }));

    this.criterias = map(criterias, criteria => new Criteria(criteria));

    if (isDefined(comment)) {
      this.comment = comment;
    }
    if (isDefined(operator)) {
      this.operator = operator;
    }

    this.negate = isDefined(negate) ? negate.toLowerCase() === 'true' : false;
  }
}

class Ovaldef extends Info {
  static entityType = 'ovaldef';

  static parseElement(element) {
    const ret = super.parseElement(element, 'ovaldef');

    ret.severity = parseSeverity(ret.score / 10);
    delete ret.score;

    const {raw_data} = ret;

    if (isDefined(raw_data) && isDefined(raw_data.definition)) {
      const {definition} = raw_data;

      if (isDefined(definition._id)) {
        ret.shortId = definition._id;
      }
      if (isDefined(definition._version)) {
        ret.version = definition._version;
      }
      if (isDefined(definition._class)) {
        ret.class = definition._class;
      }
      if (isDefined(definition._depreacted)) {
        ret.deprecation = definition._depreacted;
      }

      if (isDefined(definition.metadata)) {
        const {metadata} = definition;

        ret.affecteds = map(metadata.affected, a => ({
          products: map(a.product, product => product),
          platforms: map(a.platform, platform => platform),
          family: a._family,
        }));

        ret.references = map(metadata.reference, ref => ({
          id: ref._ref_id,
          source: ref._source,
          type: isDefined(ref._source) ? ref._source.toLowerCase() : undefined,
          url: ref._ref_url,
        }));

        ret.repository = {
          status: metadata.oval_repository.status,
          changes: Object.entries(metadata.oval_repository.dates).map(
            ([key, value]) => ({
              name: key,
              date: parseDate(value._date),
              description: value.__text,
              contributors: map(value.contributor, contributor => ({
                name: contributor.__text,
                organization: contributor._organization,
              })),
            }),
          ),
        };

        delete metadata.reference;
      } else {
        ret.affecteds = [];
        ret.references = [];
      }

      ret.criterias = map(
        definition.criteria,
        criteria => new Criteria(criteria),
      );
    } else {
      ret.affecteds = [];
      ret.references = [];
      ret.criterias = [];
    }

    delete ret.raw_data;

    ret.deprecated = parseYesNo(ret.deprecated);

    return ret;
  }

  isDeprecated() {
    return this.deprecated === YES_VALUE;
  }
}

export default Ovaldef;

// vim: set ts=2 sw=2 tw=80:
