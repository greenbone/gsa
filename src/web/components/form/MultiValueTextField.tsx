/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {Group, Pill, Stack} from '@mantine/core';

import {Input} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';

interface MultiValueTextFieldProps {
  name?: string;
  title?: string;
  placeholder?: string;
  value?: string[];
  disabled?: boolean;
  errorContent?: string;
  onChange?: (value: string[], name?: string) => void;
  validate?: (value: string) => boolean;
}

const MultiValueTextField = ({
  name,
  title,
  placeholder,
  value = [],
  disabled,
  errorContent,
  onChange,
  validate,
}: MultiValueTextFieldProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (validate && !validate(trimmed)) return;
    const updated = [...value, trimmed];
    onChange?.(updated, name);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated, name);
  };

  return (
    <Stack>
      <Input
        data-testid="form-multi-input"
        disabled={disabled}
        error={isDefined(errorContent) && String(errorContent)}
        label={title}
        name={name}
        placeholder={placeholder}
        value={inputValue}
        onChange={e => setInputValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
      <Group wrap="wrap">
        {value.map((val, index) => (
          <Pill
            key={`${val}-${index}`}
            data-testid={`pill-${val}`}
            withRemoveButton={true}
            onRemove={() => handleRemove(index)}
          >
            {val}
          </Pill>
        ))}
      </Group>
    </Stack>
  );
};

export default MultiValueTextField;
