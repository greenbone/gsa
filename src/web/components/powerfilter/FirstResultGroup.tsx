/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';

interface FirstResultGroupProps {
  first?: number;
  filter?: Filter;
  name?: string;
  onChange?: (value: number, name: string) => void;
}

const FirstResultGroup = ({
  first,
  filter,
  onChange,
  name = 'first',
}: FirstResultGroupProps) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    first = filter.get('first') as number | undefined;
  }
  return (
    <FormGroup title={_('First result')}>
      <Spinner
        min={0}
        name={name}
        type="int"
        value={first}
        onChange={
          onChange as ((value: number, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default FirstResultGroup;
