/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {
  MultiSelect as MantineMultiSelect,
  TextInput,
  Loader,
} from '@mantine/core';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

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
        styles={{root: {flexGrow: grow}}}
        placeholder={_('Loading...')}
        readOnly={true}
        rightSection={<Loader size="xs" />}
      />
    );
  }
  return (
    <MantineMultiSelect
      {...props}
      styles={{root: {flexGrow: grow}}}
      disabled={disabled || !items?.length}
      dropdownPosition={dropdownPosition}
      error={isDefined(errorContent) && `${errorContent}`}
      data={items}
      searchable={searchable}
      title={title}
      label={label}
      placeholder={placeholder}
      name={name}
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
      label: PropTypes.any.isRequired,
      value: PropTypes.any.isRequired,
    }),
  ),
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  title: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
};

export default MultiSelect;

// vim: set ts=2 sw=2 tw=80:
