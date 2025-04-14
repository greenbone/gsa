/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  NumberInput,
  NumberInputProps as MantineNumberInputProps,
} from '@mantine/core';
import {parseFloat, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {useCallback, forwardRef} from 'react';
import {NumberFormatValues} from 'react-number-format';
import styled from 'styled-components';

interface StyledNumberInputProps {
  size: string;
  errorContent?: string;
}

const getSize = (size: string) => (size === 'lg' ? '40px' : '32px');

const getFontSize = (size: string) =>
  size === 'lg' ? 'var(--mantine-font-size-lg)' : 'var(--mantine-font-size-md)';

const getBorderColor = (errorContent: string | undefined) =>
  isDefined(errorContent)
    ? 'var(--input-error-border-color)'
    : 'var(--input-border-color)';

const getColor = (errorContent: string | undefined) =>
  isDefined(errorContent) ? 'var(--mantine-color-red-5)' : 'var(--input-color)';

const StyledNumberInput = styled(NumberInput)<StyledNumberInputProps>`
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

export interface NumberFieldProps
  extends Omit<MantineNumberInputProps, 'type'> {
  allowEmpty?: boolean;
  errorContent?: string;
  onChange?: (value: number | string, name?: string) => void;
  precision?: number | string;
  type: 'int' | 'float';
  size: 'sm' | 'md' | 'lg';
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      allowEmpty = true,
      disabled,
      errorContent,
      hideControls = true,
      max,
      min,
      name,
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
      (newValue: string | number) => {
        if (!disabled && onChange) {
          onChange(newValue, name);
        }
      },
      [onChange, disabled, name],
    );

    const isAllowed = (value: NumberFormatValues): boolean =>
      allowEmpty || isDefined(value.floatValue);

    return (
      <StyledNumberInput
        data-testid="number-input"
        {...props}
        ref={ref}
        allowDecimal={type === 'float'}
        decimalScale={parseFloat(precision)}
        disabled={disabled}
        error={isDefined(errorContent) && `${errorContent}`}
        errorContent={errorContent}
        hideControls={hideControls}
        isAllowed={isAllowed}
        label={title}
        max={parseInt(max)}
        min={parseInt(min)}
        name={name}
        prefix={prefix}
        size={size}
        step={parseFloat(step)}
        suffix={suffix}
        type="text"
        value={value}
        onChange={handleChange}
      />
    );
  },
);

export default NumberField;
