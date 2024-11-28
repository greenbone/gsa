/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {DatePickerInput} from '@greenbone/opensight-ui-components-mantinev7';

import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';

import {getLocale} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

const DatePickerComponent = (
  {disabled, minDate = date(), name, value = date(), onChange, label = ''},
  ref,
) => {
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
      disabled={disabled}
      locale={getLocale()}
      value={value.toDate()}
      onChange={handleChange}
      minDate={
        minDate === false || !isDefined(minDate) ? undefined : minDate.toDate()
      }
      maxDate={date().add(3, 'years').toDate()}
      label={label}
    />
  );
};

DatePickerComponent.propTypes = {
  disabled: PropTypes.bool,
  minDate: PropTypes.instanceOf(date),
  name: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(date),
  onChange: PropTypes.func,
  label: PropTypes.string,
};

export default DatePickerComponent;
