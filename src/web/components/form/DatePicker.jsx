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

import {DatePickerOnly} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';

import {getLocale} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

const DatePickerComponent = ({
  disabled,
  minDate = date(),
  name,
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
    <DatePickerOnly
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
  minDate: PropTypes.oneOfType([PropTypes.date, PropTypes.oneOf([false])]),
  name: PropTypes.string,
  value: PropTypes.date.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string,
};

export default DatePickerComponent;
