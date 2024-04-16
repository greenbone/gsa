/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {TextInput, Loader} from '@mantine/core';

import {Select as OpenSightSelect} from '@greenbone/opensight-ui-components';

import {isDefined, isArray} from 'gmp/utils/identity';

import PropTypes, {mayRequire} from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

const findItem = (items, value) =>
  isDefined(items) ? items.find(i => i.value === value) : undefined;

const SelectValueValidator = (props, propName, componentName) => {
  const value = props[propName];
  const {items} = props;

  if (!items || !items.length) {
    return;
  }

  const item = findItem(items, value);

  if (isArray(items) && isDefined(value) && !isDefined(item)) {
    if (items.length === 0) {
      return new Error(
        'Invalid prop ' +
          propName +
          ' `' +
          value +
          '` for ' +
          componentName +
          ' component. items prop is empty.',
      );
    }
    return new Error(
      'Invalid prop ' +
        propName +
        ' `' +
        value +
        '` for ' +
        componentName +
        ' component. Prop ' +
        propName +
        ' can not be ' +
        'found in items `' +
        items.map(i => i.value) +
        '`.',
    );
  }
};

const selectValue = mayRequire(SelectValueValidator);

const Select = ({
  disabled,
  dropdownPosition,
  errorContent,
  grow,
  isLoading,
  items = [],
  label,
  name,
  placeholder,
  searchable = true,
  toolTipTitle,
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
    <OpenSightSelect
      {...props}
      styles={{root: {flexGrow: grow}}}
      dropdownPosition={dropdownPosition}
      data={items}
      disabled={disabled || !items?.length}
      error={isDefined(errorContent) && `${errorContent}`}
      searchable={searchable}
      label={label}
      title={toolTipTitle}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={handleChange}
    />
  );
};

Select.propTypes = {
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
  toolTipTitle: PropTypes.string,
  value: selectValue,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default Select;
