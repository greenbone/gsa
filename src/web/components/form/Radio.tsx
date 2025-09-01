/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {RadioProps as MantineRadioProps} from '@mantine/core';
import {RadioButton as GreenboneRadio} from '@greenbone/ui-lib';
import {isDefined} from 'gmp/utils/identity';
import useValueChange from 'web/components/form/useValueChange';

interface RadioProps<TValue>
  extends Omit<MantineRadioProps, 'onChange' | 'value'> {
  checked?: boolean;
  convert?: (value: string) => TValue;
  disabled?: boolean;
  name?: string;
  title?: string;
  value: TValue;
  onChange?: (value: TValue, name?: string) => void;
}

const Radio = <TValue,>({
  checked = false,
  disabled = false,
  name,
  title,
  value,
  convert,
  onChange,
  ...props
}: RadioProps<TValue>) => {
  const handleChange = useValueChange<TValue>({
    onChange,
    convert,
    name,
    disabled,
  });
  return (
    <GreenboneRadio
      {...props}
      checked={checked}
      disabled={disabled}
      label={title}
      name={name}
      value={isDefined(value) ? String(value) : ''}
      onChange={handleChange}
    />
  );
};

export default Radio;
