/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type ReactNode, type MouseEvent} from 'react';
import {Button as OpenSightButton, type TButtonProps} from '@greenbone/ui-lib';
import useValueChange from 'web/components/form/useValueChange';

type ButtonValue = string | number | readonly string[] | undefined;

interface ButtonProps<
  TOutputValue,
  TInputValue extends ButtonValue = string,
> extends Omit<TButtonProps, 'onClick'> {
  title?: string;
  children?: ReactNode;
  convert?: (value: TInputValue) => TOutputValue;
  disabled?: boolean;
  isLoading?: boolean;
  name?: string;
  value?: TInputValue;
  onClick?: (value: TOutputValue) => void;
}

const Button = <TOutputValue, TInputValue extends ButtonValue = string>({
  title,
  children = title,
  convert,
  disabled,
  isLoading = false,
  name,
  value,
  onClick,
  ...other
}: ButtonProps<TOutputValue, TInputValue>) => {
  const handleChange = useValueChange({
    disabled,
    onChange: onClick,
    convert,
    name,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    handleChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <OpenSightButton
      data-testid="opensight-button"
      {...other}
      disabled={disabled}
      loading={isLoading}
      name={name}
      value={value}
      onClick={handleClick} // Wrapped function
    >
      {children}
    </OpenSightButton>
  );
};

export default Button;
