/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TagsInput} from '@mantine/core';
import tagStyles from 'web/components/form/tagStyles';
import Theme from 'web/utils/Theme';

interface MultiValueTextFieldProps {
  color?: string;
  name?: string;
  title?: string;
  placeholder?: string;
  value?: string[];
  disabled?: boolean;
  onChange?: (value: string[], name?: string) => void;
  validate?: (value: string) => boolean;
}

const MultiValueTextField = ({
  color = 'green',
  name,
  title,
  placeholder,
  value = [],
  disabled,
  onChange,
  validate,
}: MultiValueTextFieldProps) => {
  const resolvedColor = tagStyles[color] ?? tagStyles.green;

  return (
    <TagsInput
      data-testid="form-multi-input"
      disabled={disabled}
      label={title}
      name={name}
      placeholder={placeholder}
      styles={{
        label: {
          fontWeight: 500,
          fontSize: 'var(--mantine-font-size-md)',
          color: 'var(--label-color)',
        },
        input: {
          backgroundColor: 'white',
          border: `1px solid ${Theme.inputBorderGray}`,
          borderRadius: 4,
        },
        pill: {
          backgroundColor: resolvedColor.bg,
          color: resolvedColor.color,
          borderRadius: '12px',
          fontWeight: 500,
        },
      }}
      value={value}
      variant="filled"
      onChange={newValue => {
        const validated = validate
          ? newValue.filter(v => validate(v))
          : newValue;
        onChange?.(validated, name);
      }}
    />
  );
};

export default MultiValueTextField;
