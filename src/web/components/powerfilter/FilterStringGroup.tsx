/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isString} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface FilterStringGroupProps {
  filter: string | Filter;
  name?: string;
  onChange?: (value: string, name: string) => void;
}

const FilterStringGroup = ({
  filter,
  onChange,
  name = 'filter',
}: FilterStringGroupProps) => {
  const [_] = useTranslation();
  const filterString = isString(filter)
    ? filter
    : filter.toFilterCriteriaString();
  return (
    <FormGroup title={_('Filter')}>
      <TextField
        grow="1"
        name={name}
        size="30"
        value={filterString}
        onChange={
          onChange as ((value: string, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default FilterStringGroup;
