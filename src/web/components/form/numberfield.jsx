/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NumberInput} from '@mantine/core';
import {parseFloat, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback, forwardRef} from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';

const getSize = size => (size === 'lg' ? '40px' : '32px');

const getFontSize = size =>
  size === 'lg' ? 'var(--mantine-font-size-lg)' : 'var(--mantine-font-size-md)';

const getBorderColor = errorContent =>
  isDefined(errorContent)
    ? 'var(--input-error-border-color)'
    : 'var(--input-border-color)';

const getColor = errorContent =>
  isDefined(errorContent) ? 'var(--mantine-color-red-5)' : 'var(--input-color)';

const StyledNumberInput = styled(NumberInput)`
  input,
  .mantine-NumberInput-controls {
    height: ${({size}) => getSize(size)};
    min-height: ${({size}) => getSize(size)};
    font-size: ${({size}) => getFontSize(size)};
    border-color: ${({errorContent}) => getBorderColor(errorContent)};
    color: ${({errorContent}) => getColor(errorContent)};
  }
  .mantine-NumberInput-control {
    border-color: ${({errorContent}) => getBorderColor(errorContent)};
    color: ${({errorContent}) => getColor(errorContent)};
  }
`;

const NumberField = forwardRef(
  (
    {
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
      size = 'md',
      onChange,
      ...props
    },
    ref,
  ) => {
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
      <StyledNumberInput
        data-testid="number-input"
        {...props}
        ref={ref}
        allowDecimal={type === 'float'}
        disabled={disabled}
        error={isDefined(errorContent) && `${errorContent}`}
        errorContent={errorContent}
        hideControls={hideControls}
        label={title}
        max={parseInt(max)}
        min={parseInt(min)}
        name={name}
        precision={parseFloat(precision)}
        prefix={prefix}
        size={size}
        step={parseFloat(step)}
        suffix={suffix}
        value={value}
        onChange={handleChange}
      />
    );
  },
);

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
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  height: PropTypes.number,
  onChange: PropTypes.func,
};

export default NumberField;
