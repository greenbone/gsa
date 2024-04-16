/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import {parseSeverity} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {UNSET_VALUE} from 'web/utils/render';

import RelationSelector from 'web/components/powerfilter/relationselector';

import FormGroup from 'web/components/form/formgroup';
import NumberField from 'web/components/form/numberfield';

const SeverityValuesGroup = ({filter, name, title, onChange}) => {
  const term = filter.getTerm(name);
  const severity = isDefined(term) ? parseSeverity(term.value) : 0;

  const [rel, setRel] = useState(isDefined(term) ? term.relation : UNSET_VALUE);
  const keyword = name;

  return (
    <FormGroup title={title} direction="row">
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
        // eslint-disable-next-line no-shadow
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
