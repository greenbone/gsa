/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Textarea as GreenboneTextArea} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import useValueChange from 'web/components/form/useValueChange';

interface TextAreaProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof GreenboneTextArea>,
    'onChange' | 'value'
  > {
  autosize?: boolean;
  disabled?: boolean;
  errorContent?: string;
  minRows?: number | string;
  maxRows?: number | string;
  name?: string;
  placeholder?: string;
  title?: string;
  value?: string;
  onChange?: (value: string, name?: string) => void;
  classNames?: {
    input?: string;
  };
}

const TextArea = ({
  autosize,
  disabled = false,
  errorContent,
  maxRows,
  minRows,
  name,
  onChange,
  placeholder,
  title,
  value,
  classNames,
  ...props
}: TextAreaProps) => {
  const handleChange = useValueChange<string>({disabled, name, onChange});
  return (
    <GreenboneTextArea
      {...props}
      autosize={autosize}
      classNames={{
        input: `default-input-class ${classNames?.input || ''}`,
      }}
      disabled={disabled}
      error={isDefined(errorContent) && `${errorContent}`}
      label={title}
      maxRows={maxRows}
      minRows={minRows}
      name={name}
      placeholder={placeholder}
      resize="vertical"
      value={value}
      onChange={handleChange}
    />
  );
};

export default TextArea;
