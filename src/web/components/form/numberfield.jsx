/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
