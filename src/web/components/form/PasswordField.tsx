/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {PasswordInput} from '@greenbone/ui-lib';
import {isDefined} from 'gmp/utils/identity';
import useValueChange from 'web/components/form/useValueChange';

interface PasswordFieldProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof PasswordInput>,
    'onChange'
  > {
  autoComplete?: string;
  disabled?: boolean;
  errorContent?: string;
  grow?: number | string;
  name?: string;
  placeholder?: string;
  title?: string;
  value?: string;
  onChange?: (value: string, name?: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PasswordField = ({
  autoComplete,
  disabled,
  errorContent,
  grow,
  name,
  placeholder,
  title,
  value,
  onChange,
  onKeyDown,
  ...props
}: PasswordFieldProps) => {
  const handleChange = useValueChange<string>({onChange, name, disabled});
  return (
    <PasswordInput
      data-testid="password-input"
      {...props}
      autoComplete={autoComplete}
      disabled={disabled}
      error={isDefined(errorContent) && String(errorContent)}
      label={title}
      name={name}
      placeholder={placeholder}
      styles={{root: {flexGrow: grow}}}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
};

export default PasswordField;
