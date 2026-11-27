/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TagsInput} from '@mantine/core';
import tagStyles, {type TagStyleName} from 'web/components/form/tag-styles';
import Theme from 'web/utils/theme';

interface MultiValueTextFieldProps {
  'aria-label'?: string;
  color?: TagStyleName;
  grow?: number | string;
  name?: string;
  title?: string;
  placeholder?: string;
  splitChars?: string[];
  value?: string[];
  disabled?: boolean;
  onChange?: (value: string[], name?: string) => void;
  validate?: (value: string) => boolean;
}

const MultiValueTextField = ({
  'aria-label': ariaLabel,
  color = 'green',
  name,
  title,
  placeholder,
  splitChars,
  value = [],
  disabled,
  grow,
  validate,
  onChange,
}: MultiValueTextFieldProps) => {
  const resolvedColor = tagStyles[color] ?? tagStyles.green;

  return (
    <TagsInput
      aria-label={ariaLabel}
      data-testid="form-multi-input"
      disabled={disabled}
      label={title}
      name={name}
      placeholder={placeholder}
      splitChars={splitChars}
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
        root: {
          flexGrow: grow,
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
