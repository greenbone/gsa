/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Select as OpenSightSelect} from '@greenbone/opensight-ui-components-mantinev7';
import {Loader} from '@mantine/core';
import {_} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import {useState, useCallback} from 'react';
import useTranslation from 'web/hooks/useTranslation';

interface SelectItem {
  label: string;
  value: string;
  deprecated?: string;
}

interface SelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof OpenSightSelect>,
    'onChange'
  > {
  allowDeselect?: boolean;
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
  toolTipTitle?: string;
  value?: string;
  width?: string;
  onChange?: (value: string, name?: string) => void;
}

const renderSelectOption = ({
  option: {label, deprecated},
}: {
  option: SelectItem;
}) => {
  if (deprecated === '1') {
    return <s>{`${label} (${_('Deprecated')})`}</s>;
  }

  return label;
};

const Select = ({
  allowDeselect = false,
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
  scrollAreaProps = {
    type: 'hover',
    scrollbarSize: 12,
    offsetScrollbars: 'present',
  },
  onChange,
  ...props
}: SelectProps) => {
  const [_] = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const handleChange = useCallback(
    (newValue: string | null) => {
      if (isDefined(onChange)) {
        onChange(newValue as string, name);
      }
      setSearchValue('');
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
        deprecated: item.deprecated,
      }));
  const selectedValue = isLoading ? undefined : String(value);

  return (
    <OpenSightSelect
      {...props}
      allowDeselect={allowDeselect}
      comboboxProps={{position: dropdownPosition}}
      data={selectableItems}
      data-testid={'form-select'}
      disabled={disabled || !items?.length}
      error={isDefined(errorContent) && `${errorContent}`}
      label={label}
      name={name}
      placeholder={selectPlaceholder}
      renderOption={renderSelectOption}
      rightSection={rightSection}
      scrollAreaProps={scrollAreaProps}
      searchValue={searchValue}
      searchable={searchable}
      styles={{root: {flexGrow: grow}}}
      title={toolTipTitle}
      value={selectedValue}
      onChange={handleChange}
      onSearchChange={setSearchValue}
    />
  );
};

export default Select;
