/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';
import {CheckboxProps as MantineCheckboxProps} from '@mantine/core';
import {Checkbox as OpenSightCheckbox} from '@greenbone/opensight-ui-components-mantinev7';

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface CheckboxProps<TCheck> extends Omit<MantineCheckboxProps, 'onChange'> {
  title?: string;
  name?: string;
  disabled?: boolean;
  checked?: boolean;
  checkedValue?: TCheck;
  unCheckedValue?: TCheck;
  toolTipTitle?: string;
  onChange?: (value: TCheck, name?: string) => void;
}

const valueFunc = (event: ChangeEvent): boolean => event.target.checked;

const Checkbox = <TCheck = boolean,>({
  title,
  name,
  checked = false,
  disabled,
  checkedValue = true as TCheck,
  unCheckedValue = false as TCheck,
  toolTipTitle,
  onChange,
  ...props
}: CheckboxProps<TCheck>) => {
  const handleChange = useCallback(
    (event: ChangeEvent) => {
      const newValue = valueFunc(event) ? checkedValue : unCheckedValue;
      if (!disabled && onChange) {
        onChange(newValue, name);
      }
    },
    [onChange, disabled, name, checkedValue, unCheckedValue],
  );
  return (
    <OpenSightCheckbox
      data-testid="opensight-checkbox"
      {...props}
      checked={checked}
      disabled={disabled}
      label={title}
      name={name}
      title={toolTipTitle}
      onChange={handleChange}
    />
  );
};

export default Checkbox;
