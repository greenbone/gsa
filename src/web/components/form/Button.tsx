/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {ReactNode, MouseEvent} from 'react';
import {Button as OpenSightButton} from '@greenbone/opensight-ui-components-mantinev7';
import useValueChange from 'web/components/form/useValueChange';

interface ButtonProps {
  title?: string;
  children?: ReactNode;
  convert?: (value: unknown) => unknown;
  disabled?: boolean;
  isLoading?: boolean;
  name?: string;
  value?: string | number | string[] | undefined;
  onClick?: (value: unknown) => void;
  [key: string]: unknown;
}

const Button: React.FC<ButtonProps> = ({
  title,
  children = title,
  convert,
  disabled,
  isLoading = false,
  name,
  value,
  onClick,
  ...other
}) => {
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
