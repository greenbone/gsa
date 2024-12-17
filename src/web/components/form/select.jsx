/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Select as OpenSightSelect} from '@greenbone/opensight-ui-components-mantinev7';
import {Loader} from '@mantine/core';
import {_} from 'gmp/locale/lang';
import {isDefined, isArray} from 'gmp/utils/identity';
import {useCallback, forwardRef} from 'react';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes, {mayRequire} from 'web/utils/proptypes';

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
  const selectableItems = isLoading
    ? []
    : items.map(item => ({
        value: String(item.value),
        label: item.label,
      }));
  const selectedValue = isLoading ? undefined : String(value);

  return (
    <OpenSightSelect
      {...props}
      data={selectableItems}
      data-testid={'form-select'}
      disabled={disabled || !items?.length}
      dropdownPosition={dropdownPosition}
      error={isDefined(errorContent) && `${errorContent}`}
      itemComponent={SelectItem}
      label={label}
      name={name}
      placeholder={selectPlaceholder}
      rightSection={rightSection}
      searchable={searchable}
      styles={{root: {flexGrow: grow}}}
      title={toolTipTitle}
      value={selectedValue}
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
