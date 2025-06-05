/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Checkbox as OpenSightCheckbox} from '@greenbone/opensight-ui-components-mantinev7';
import {CheckboxProps as MantineCheckboxProps} from '@mantine/core';
import React, {useCallback} from 'react';

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

const valueFunc = (event: ChangeEvent): boolean => event.target.checked;

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
      title={toolTipTitle}
      onChange={handleChange}
    />
  );
};

export default Checkbox;
