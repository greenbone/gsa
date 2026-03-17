/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {Loader} from '@mantine/core';
import {Select as OpenSightSelect} from '@greenbone/ui-lib';
import {_} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import useTranslation from 'web/hooks/useTranslation';

export interface SelectItem {
  label: string;
  value: string;
  deprecated?: boolean;
}

export interface SelectProps<TValue> extends Omit<
  React.ComponentPropsWithoutRef<typeof OpenSightSelect>,
  'onChange' | 'value'
> {
  allowDeselect?: boolean;
  'data-testid'?: string;
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
  value?: TValue;
  width?: string;
  onChange?: (value: TValue, name?: string) => void;
}

const renderSelectOption = ({
  option: {label, deprecated},
}: {
  option: SelectItem;
}) => {
  if (deprecated === true) {
    return <s>{`${label} (${_('Deprecated')})`}</s>;
  }

  return label;
};

const Select = <TValue extends string | undefined = string>({
  allowDeselect = false,
  'data-testid': dataTestId = 'form-select',
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
}: SelectProps<TValue>) => {
  const [_] = useTranslation();

  const handleChange = useCallback(
    (newValue: string | null) => {
      if (isDefined(onChange)) {
        onChange((newValue ?? undefined) as TValue, name);
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
        deprecated: item.deprecated,
      }));

  let selectedValue: string | undefined;
  if (isLoading) {
    selectedValue = undefined;
  } else if (isDefined(value)) {
    selectedValue = String(value);
  } else {
    selectedValue = undefined;
  }

  return (
    <OpenSightSelect
      {...props}
      allowDeselect={allowDeselect}
      comboboxProps={{position: dropdownPosition}}
      data={selectableItems}
      data-testid={dataTestId}
      disabled={disabled || !items?.length}
      error={isDefined(errorContent) && `${errorContent}`}
      label={label}
      name={name}
      placeholder={selectPlaceholder}
      renderOption={renderSelectOption}
      rightSection={rightSection}
      scrollAreaProps={scrollAreaProps}
      searchable={searchable}
      styles={{root: {flexGrow: grow}}}
      title={toolTipTitle}
      value={selectedValue}
      onChange={handleChange}
    />
  );
};

export default Select;
