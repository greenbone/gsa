/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import YesNoRadio from 'web/components/form/YesNoRadio';
import useTranslation from 'web/hooks/useTranslation';

interface ApplyOverridesGroupProps {
  filter?: Filter;
  name?: string;
  overrides?: YesNo;
  onChange?: (value: YesNo, name: string) => void;
}

const ApplyOverridesGroup = ({
  filter,
  name = 'apply_overrides',
  overrides,
  onChange,
}: ApplyOverridesGroupProps) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    overrides = filter.get('apply_overrides') as YesNo | undefined;
  }
  return (
    <FormGroup title={_('Apply Overrides')}>
      <YesNoRadio
        data-testid="apply-overrides-yesnoradio"
        name={name}
        value={overrides}
        onChange={
          onChange as ((value: YesNo, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default ApplyOverridesGroup;
