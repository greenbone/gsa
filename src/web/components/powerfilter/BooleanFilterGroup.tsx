/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import {parseYesNo, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import YesNoRadio from 'web/components/form/YesNoRadio';

interface BooleanFilterGroupProps {
  filter?: Filter;
  name: string;
  title?: string;
  onChange?: (value: YesNo, name: string) => void;
}

const BooleanFilterGroup = ({
  filter,
  name,
  title,
  onChange,
}: BooleanFilterGroupProps) => {
  let filterVal: YesNo | undefined;

  if (isDefined(filter)) {
    filterVal = parseYesNo(filter.get(name));
  }

  return (
    <FormGroup title={title}>
      <YesNoRadio
        convert={parseYesNo}
        data-testid="boolean-filter-yesnoradio"
        name={name}
        value={filterVal}
        onChange={
          onChange as ((value: YesNo, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default BooleanFilterGroup;
