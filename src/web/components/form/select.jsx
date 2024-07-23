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

import {useCallback, forwardRef} from 'react';

import {Loader} from '@mantine/core';

import {Select as OpenSightSelect} from '@greenbone/opensight-ui-components';

import {isDefined, isArray} from 'gmp/utils/identity';

import PropTypes, {mayRequire} from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import {_} from 'gmp/locale/lang';

const findItem = (items, value) =>
  isDefined(items) ? items.find(i => i.value === value) : undefined;

const SelectValueValidator = (props, propName, componentName) => {
  const value = props[propName];
  const {items} = props;

  if (!items?.length) {
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

const renderLabel = props => {
  const {label, deprecated} = props;

  if (deprecated) {
    return <s>{`${label} (${_('Deprecated')})`}</s>;
  }

  return <span>{label}</span>;
};

export const SelectItem = forwardRef((props, ref) => {
  return (
    <div ref={ref} {...props}>
      {renderLabel(props)}
    </div>
  );
});

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

  const selectPlaceholder = isLoading ? _('Loading...') : placeholder;
  const rightSection = isLoading && <Loader size="xs" />;
  const selectableItems = isLoading ? [] : items;
  const selectedValue = isLoading ? undefined : value;

  return (
    <OpenSightSelect
      {...props}
      styles={{root: {flexGrow: grow}}}
      dropdownPosition={dropdownPosition}
      data={selectableItems}
      disabled={disabled || !items?.length}
      error={isDefined(errorContent) && `${errorContent}`}
      searchable={searchable}
      label={label}
      title={toolTipTitle}
      placeholder={selectPlaceholder}
      name={name}
      value={selectedValue}
      onChange={handleChange}
      rightSection={rightSection}
      itemComponent={SelectItem}
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
