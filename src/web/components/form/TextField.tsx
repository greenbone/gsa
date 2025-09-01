/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Input} from '@greenbone/ui-lib';
import {isDefined} from 'gmp/utils/identity';
import useValueChange from 'web/components/form/useValueChange';

interface TextFieldProps<TValue>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    'onChange' | 'value'
  > {
  autoComplete?: string;
  convert?: (value: string) => TValue;
  disabled?: boolean;
  errorContent?: string;
  grow?: number | string;
  name?: string;
  placeholder?: string;
  title?: string;
  value?: TValue;
  onChange?: (value: TValue, name?: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TextField = <TValue = string,>({
  autoComplete,
  convert,
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
}: TextFieldProps<TValue>) => {
  const handleChange = useValueChange<TValue>({
    onChange,
    disabled,
    name,
    convert,
  });
  return (
    <Input
      data-testid="form-input"
      {...props}
      autoComplete={autoComplete}
      disabled={disabled}
      error={isDefined(errorContent) && String(errorContent)}
      label={title}
      name={name}
      placeholder={placeholder}
      styles={{root: {flexGrow: grow}}}
      value={isDefined(value) ? String(value) : undefined}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
};

export default TextField;
