/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import RelationSelector from 'web/components/powerfilter/RelationSelector';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_VALUE} from 'web/utils/Render';

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
