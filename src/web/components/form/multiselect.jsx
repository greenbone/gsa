/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
