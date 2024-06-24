/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {DateTimePicker} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';

import {getLocale} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

const DatePickerComponent = ({
  disabled,
  minDate = date(),
  name,
  width = '100%',
  value = date(),
  onChange,
  label = '',
}) => {
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
    <DateTimePicker
      disabled={disabled}
      locale={getLocale()}
      value={value.toDate()}
      onChange={handleChange}
      minDate={
        minDate === false || !isDefined(minDate) ? undefined : minDate.toDate()
      }
      maxDate={date().add(3, 'years').toDate()}
      style={{width}}
      withSeconds={false}
      label={label}
    />
  );
};

DatePickerComponent.propTypes = {
  disabled: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.date, PropTypes.oneOf([false])]),
  name: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.date.isRequired,
  width: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
};

export default DatePickerComponent;
