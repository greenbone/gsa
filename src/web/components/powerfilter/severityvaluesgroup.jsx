/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';

import FormGroup from 'web/components/form/formgroup';
import RelationSelector from 'web/components/powerfilter/relationselector';
import NumberField from 'web/components/form/numberfield';
import Divider from 'web/components/layout/divider';

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
  const severity = isDefined(term) ? parseSeverity(term.value) : 0;

  const [rel, setRel] = useState(isDefined(term) ? term.relation : UNSET_VALUE);
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
