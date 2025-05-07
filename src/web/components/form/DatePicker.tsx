/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DatePickerInput} from '@greenbone/opensight-ui-components-mantinev7';
import {DateValue} from '@mantine/dates';
import date, {Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import {useCallback} from 'react';
import useLanguage from 'web/hooks/useLanguage';

interface DatePickerComponentProps {
  disabled?: boolean;
  minDate?: Date | false;
  maxDate?: Date;
  name: string;
  value?: Date;
  onChange?: (value: Date, name: string) => void;
  label?: string;
}

const DatePickerComponent = ({
  disabled,
  minDate = date(),
  maxDate = date().add(3, 'years'),
  name,
  value = date(),
  onChange,
  label = '',
}: DatePickerComponentProps) => {
  const [language] = useLanguage();
  const handleChange = useCallback(
    (newValue: DateValue) => {
      if (isDefined(onChange)) {
        const valueToPass = date(newValue);
        onChange(valueToPass, name);
      }
    },
    [name, onChange],
  );

  return (
    <DatePickerInput
      data-testid="datepicker-input"
      disabled={disabled}
      label={label}
      locale={language}
      maxDate={isDefined(maxDate) ? maxDate.toDate() : undefined}
      minDate={
        minDate === false || !isDefined(minDate) ? undefined : minDate.toDate()
      }
      value={value.toDate()}
      onChange={handleChange}
    />
  );
};

export default DatePickerComponent;
