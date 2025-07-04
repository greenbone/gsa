/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TagsInput} from '@mantine/core';
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

const tagStyles: Record<string, {bg: string; color: string}> = {
  green: {
    bg: Theme.lightGreen,
    color: Theme.darkGreen,
  },
  red: {
    bg: Theme.lightRed,
    color: Theme.darkRed,
  },
  blue: {
    bg: Theme.lightBlue,
    color: Theme.blue,
  },
  gray: {
    bg: Theme.dialogGray,
    color: Theme.mediumGray,
  },
};

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
