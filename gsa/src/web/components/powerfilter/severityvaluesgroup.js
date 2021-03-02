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
import React, {useState} from 'react';

import {parseSeverity} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import FormGroup from 'web/components/form/formgroup';
import NumberField from 'web/components/form/numberfield';
import Divider from 'web/components/layout/divider';
import RelationSelector from 'web/components/powerfilter/relationselector';

import PropTypes from 'web/utils/proptypes';

const SeverityValuesGroup = ({filter, name, title, onChange}) => {
  /* useState is analogous to setState in class components.
   * the first argument is the state variable.
   * the second argument can be thought of as the handler.
   * we call the second argument when we "set state", so to speak.
   * state variables don't disappear once we finish calling the hook.
   * so they're functionally very similar to a state in a class component.
   * you can have more than one state
   */

  const term = filter.getTerm(name);
  const severity = isDefined(term) ? parseSeverity(term.value) : undefined;

  const [rel, setRel] = useState(isDefined(term) ? term.relation : '='); // here rel is set to '='
  const keyword = name;

  return (
    <FormGroup title={title}>
      <Divider>
        <RelationSelector
          relation={rel}
          onChange={newRel => {
            setRel(newRel);
            onChange(severity, keyword, newRel);
          }}
        />
        <NumberField
          name={keyword}
          type="int"
          min={0}
          max={10}
          value={severity}
          size="5"
          // eslint-disable-next-line no-shadow
          onChange={(value = severity, name = keyword) =>
            onChange(value, name, rel)
          }
        />
      </Divider>
    </FormGroup>
  );
};

SeverityValuesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default SeverityValuesGroup;
