/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* this is experimental. trying to consolidate all filter terms whose
 * method should be ~'value' into one. */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';

interface FilterSearchGroupProps {
  filter?: Filter;
  name: string;
  title?: string;
  onChange?: (value: string, name?: string) => void;
}

const FilterSearchGroup = ({
  name,
  filter,
  title,
  onChange,
}: FilterSearchGroupProps) => {
  let filterVal: string | undefined;

  if (!isDefined(filterVal) && isDefined(filter)) {
    filterVal = filter.get(name) as string | undefined;
    if (isDefined(filterVal)) {
      if (filterVal.startsWith('"')) {
        filterVal = filterVal.slice(1);
      }
      if (filterVal.endsWith('"')) {
        filterVal = filterVal.slice(0, -1);
      }
    }
  }

  return (
    <FormGroup title={title}>
      <TextField name={name} value={filterVal} onChange={onChange} />
    </FormGroup>
  );
};

export default FilterSearchGroup;
