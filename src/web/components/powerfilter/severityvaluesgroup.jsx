/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React, {useState} from 'react';
import FormGroup from 'web/components/form/formgroup';
import NumberField from 'web/components/form/numberfield';
import RelationSelector from 'web/components/powerfilter/relationselector';
import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';

const SeverityValuesGroup = ({filter, name, title, onChange}) => {
  const term = filter.getTerm(name);
  const severity = isDefined(term) ? parseSeverity(term.value) : 0;

  const [rel, setRel] = useState(isDefined(term) ? term.relation : UNSET_VALUE);
  const keyword = name;

  return (
    <FormGroup direction="row" title={title}>
      <RelationSelector
        relation={rel}
        onChange={newRel => {
          setRel(newRel);
          onChange(severity, keyword, newRel);
        }}
      />
      <NumberField
        data-testid="severity-value-filter"
        max={10}
        min={0}
        name={keyword}
        type="int"
        value={severity}
         
        onChange={(value = severity, name = keyword) =>
          onChange(value, name, rel)
        }
      />
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
