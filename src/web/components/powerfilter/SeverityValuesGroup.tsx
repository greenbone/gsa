/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import Filter from 'gmp/models/filter';
import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import RelationSelector from 'web/components/powerfilter/RelationSelector';
import {UNSET_VALUE} from 'web/utils/Render';

interface SeverityValuesGroupProps {
  filter: Filter;
  name?: string;
  title?: string;
  onChange?: (value: number, name?: string, relation?: string) => void;
}

const SeverityValuesGroup = ({
  filter,
  name,
  title,
  onChange,
}: SeverityValuesGroupProps) => {
  const term = filter.getTerm(name);
  const severity = parseSeverity(term?.value) ?? 0;

  const [rel, setRel] = useState(isDefined(term) ? term.relation : UNSET_VALUE);
  const keyword = name;

  return (
    <FormGroup direction="row" title={title}>
      <RelationSelector
        relation={rel}
        onChange={newRel => {
          setRel(newRel);
          isDefined(onChange) && onChange(severity, keyword, newRel);
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
          isDefined(onChange) && onChange(value, name, rel)
        }
      />
    </FormGroup>
  );
};

export default SeverityValuesGroup;
