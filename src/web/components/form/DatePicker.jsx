/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DatePickerInput} from '@greenbone/opensight-ui-components-mantinev7';
import date from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback} from 'react';
import useLanguage from 'web/hooks/useLanguage';
import PropTypes from 'web/utils/PropTypes';

const DatePickerComponent = ({
  disabled,
  minDate = date(),
  name,
  value = date(),
  onChange,
  label = '',
}) => {
  const [language] = useLanguage();
  const handleChange = useCallback(
    newValue => {
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
      maxDate={date().add(3, 'years').toDate()}
      minDate={
        minDate === false || !isDefined(minDate) ? undefined : minDate.toDate()
      }
      value={value.toDate()}
      onChange={handleChange}
    />
  );
};

DatePickerComponent.propTypes = {
  disabled: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.date, PropTypes.oneOf([false])]),
  name: PropTypes.string.isRequired,
  value: PropTypes.date,
  onChange: PropTypes.func,
  label: PropTypes.string,
};

export default DatePickerComponent;
