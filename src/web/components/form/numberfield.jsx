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

import {NumberInput} from '@mantine/core';

import PropTypes from 'web/utils/proptypes';
import {parseFloat, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

const NumberField = ({
  disabled,
  errorContent,
  hideControls = true,
  max,
  min,
  name,
  placeholder,
  precision,
  prefix,
  suffix,
  step,
  title,
  type = 'int',
  value,
  onChange,
  ...props
}) => {
  if (!isDefined(step)) {
    step = type === 'float' ? 0.1 : 1;
  }
  if (!isDefined(precision)) {
    precision = type === 'float' ? 2 : 0;
  }

  const handleChange = useCallback(
    newValue => {
      if (!disabled && onChange) {
        onChange(newValue, name);
      }
    },
    [onChange, disabled, name],
  );
  return (
    <NumberInput
      {...props}
      // allowDecimal={type === 'float'} // requires @mantine/core >= 7.0.0
      error={isDefined(errorContent) && `${errorContent}`}
      precision={parseFloat(precision)}
      disabled={disabled}
      hideControls={hideControls}
      label={title}
      max={parseInt(max)}
      min={parseInt(min)}
      name={name}
      // prefix={prefix} // requires @mantine/core >= 7.0.0
      // suffix={suffix} // requires @mantine/core >= 7.0.0
      step={parseFloat(step)}
      value={value}
      onChange={handleChange}
    />
  );
};

NumberField.propTypes = {
  disabled: PropTypes.bool,
  errorContent: PropTypes.toString,
  hideControls: PropTypes.bool,
  max: PropTypes.numberOrNumberString,
  min: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  precision: PropTypes.numberOrNumberString,
  prefix: PropTypes.string,
  step: PropTypes.numberOrNumberString,
  suffix: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.number,
  onChange: PropTypes.func,
};

export default NumberField;

// vim: set ts=2 sw=2 tw=80:
