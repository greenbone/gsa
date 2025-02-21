/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  MultiSelect as MantineMultiSelect,
  TextInput,
  Loader,
} from '@mantine/core';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback} from 'react';
import styled from 'styled-components';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const getSize = size => (size === 'lg' ? '40px' : '32px');

const getFontSize = size =>
  size === 'lg' ? 'var(--mantine-font-size-lg)' : 'var(--mantine-font-size-md)';

const getBorderColor = errorContent =>
  isDefined(errorContent)
    ? 'var(--input-error-border-color)'
    : 'var(--input-border-color)';

const getColor = errorContent =>
  isDefined(errorContent) ? 'var(--mantine-color-red-5)' : 'var(--input-color)';

const StyledMultiSelect = styled(MantineMultiSelect)`
  .mantine-MultiSelect-input,
  .mantine-MultiSelect-item {
    min-height: ${({size}) => getSize(size)};
    font-size: ${({size}) => getFontSize(size)};
    border-color: ${({errorContent}) => getBorderColor(errorContent)};
    color: ${({errorContent}) => getColor(errorContent)};
  }
  .mantine-MultiSelect-item:hover {
    background-color: var(--select-selected-background-color-hover);
  }
`;

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
  height,
  onChange,
  ...props
}) => {
  const [_] = useTranslation();
  const handleChange = useCallback(
    newValue => {
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
      data={items}
      disabled={disabled || !items?.length}
      dropdownPosition={dropdownPosition}
      error={isDefined(errorContent) && `${errorContent}`}
      errorContent={errorContent}
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

MultiSelect.propTypes = {
  disabled: PropTypes.bool,
  dropdownPosition: PropTypes.oneOf(['top', 'bottom']),
  errorContent: PropTypes.toString,
  grow: PropTypes.numberOrNumberString,
  isLoading: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  title: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  height: PropTypes.number,
  onChange: PropTypes.func,
};

export default MultiSelect;
