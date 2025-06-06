/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {
  MultiSelect as MantineMultiSelect,
  TextInput,
  Loader,
  MultiSelectProps as MantineMultiSelectProps,
  MantineSize,
} from '@mantine/core';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import {SelectItem} from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';

type Size = MantineSize | undefined;

const getSize = (size: Size) => (size === 'lg' ? '40px' : '32px');

const getFontSize = (size: Size) =>
  size === 'lg' ? 'var(--mantine-font-size-lg)' : 'var(--mantine-font-size-md)';

const getBorderColor = (errorContent: string | undefined) =>
  isDefined(errorContent)
    ? 'var(--input-error-border-color)'
    : 'var(--input-border-color)';

const getColor = (errorContent: string | undefined) =>
  isDefined(errorContent) ? 'var(--mantine-color-red-5)' : 'var(--input-color)';

interface StyledMultiSelectProps extends MantineMultiSelectProps {
  $errorContent?: string;
  size?: Size;
}

const StyledMultiSelect = styled(MantineMultiSelect)<StyledMultiSelectProps>`
  .mantine-MultiSelect-input,
  .mantine-MultiSelect-item {
    min-height: ${({size}) => getSize(size)};
    font-size: ${({size}) => getFontSize(size)};
    border-color: ${({$errorContent}) => getBorderColor($errorContent)};
    color: ${({$errorContent}) => getColor($errorContent)};
  }
  .mantine-MultiSelect-item:hover {
    background-color: var(--select-selected-background-color-hover);
  }
`;

interface MultiSelectProps extends StyledMultiSelectProps {
  disabled?: boolean;
  dropdownPosition?: 'top' | 'bottom';
  errorContent?: string;
  grow?: number | string;
  isLoading?: boolean;
  items?: SelectItem[];
  label?: string;
  name?: string;
  placeholder?: string;
  searchable?: boolean;
  title?: string;
  value?: string[];
  onChange?: (value: string[], name?: string) => void;
}

const MultiSelect = ({
  disabled,
  dropdownPosition,
  errorContent,
  grow,
  items = [],
  isLoading,
  label,
  name,
  placeholder,
  searchable = true,
  title,
  value,
  size = 'md',
  onChange,
  ...props
}: MultiSelectProps) => {
  const [_] = useTranslation();
  const handleChange = useCallback(
    (newValue: string[]) => {
      if (isDefined(onChange)) {
        onChange(newValue, name);
      }
    },
    [name, onChange],
  );

  if (isLoading) {
    return (
      <TextInput
        data-testid="text-input"
        placeholder={_('Loading...')}
        readOnly={true}
        rightSection={<Loader size="xs" />}
        styles={{root: {flexGrow: grow}}}
      />
    );
  }
  return (
    <StyledMultiSelect
      data-testid="multi-select"
      {...props}
      $errorContent={errorContent}
      comboboxProps={{position: dropdownPosition}}
      data={items}
      disabled={disabled || !items?.length}
      error={isDefined(errorContent) && `${errorContent}`}
      label={label}
      name={name}
      placeholder={placeholder}
      searchable={searchable}
      size={size}
      styles={{root: {flexGrow: grow}}}
      title={title}
      value={value}
      onChange={handleChange}
    />
  );
};

export default MultiSelect;
