/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import React from 'react';

import styled from 'styled-components';

import {parseFloat, parseInt} from 'gmp/parser';

import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import {fixedValue} from 'gmp/utils/number';

import withLayout from 'web/components/layout/withLayout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import NumberField from './numberfield';

const precisionOf = num => {
  const str = num.toString();
  const decimal = str.indexOf('.');

  return decimal === -1 ? 0 : str.length - decimal - 1;
};

const StyledSpinner = styled.span`
  border-radius: 2px;
  border: 1px solid ${Theme.lightGray};
  background-color: ${Theme.white};
  font-size: 1.1em;
  position: relative;
  display: inline-block;
  overflow: hidden;
  padding: 0;
  vertical-align: middle;
  ${props =>
    props.disabled
      ? {
          color: Theme.lightGray,
          cursor: 'not-allowed',
        }
      : undefined};
`;

const StyledInput = styled(NumberField)`
  /* use font and line settings from parents not from browser default */
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  border: none;
  background: none;
  color: inherit;
  padding: 0;
  margin: 0.2em 0;
  vertical-align: middle;
  margin-left: 0.4em;
  margin-right: 22px;
`;

const SpinnerButton = styled.span`
  background-color: ${Theme.lightGray};
  color: ${Theme.mediumGray};
  border-left: 1px solid ${Theme.darkGray};
  width: 16px;
  height: 50%;
  font-size: 0.6em;
  padding: 0;
  margin: 0;
  text-align: center;
  vertical-align: middle;
  position: absolute;
  right: 0;
  cursor: default;
  display: block;
  overflow: hidden;
  text-decoration: none;
  user-select: none; /* don't select icon text on double click */
  &:hover {
    background-color: ${Theme.green};
    color: ${Theme.white};
    text-decoration: none;
  }
  &:active {
    background-color: ${Theme.white};
    color: ${Theme.darkGreen};
    text-decoration: none;
  }
  ${props =>
    props.disabled
      ? {
          color: Theme.lightGray,
          background: Theme.dialogGray,
          cursor: 'not-allowed',
          '&:hover': {
            color: Theme.mediumGray,
            background: Theme.lightGray,
            cursor: 'not-allowed',
          },
        }
      : undefined}
`;

const SpinnerButtonUp = styled(SpinnerButton)`
  border-top-right-radius: 1px;
  top: 0;
`;

const SpinnerButtonDown = styled(SpinnerButton)`
  border-bottom-right-radius: 1px;
  bottom: 0;
`;

const SpinnerComponent = props => {
  const getStep = () => {
    const {step, type} = props;

    if (isDefined(step)) {
      return parseFloat(step);
    }
    return type === 'float' ? 0.1 : 1;
  };

  const handleUpButton = event => {
    const step = getStep();

    event.preventDefault();

    const {value = 0} = props;

    setAdjustedValue(parseFloat(value) + step);
  };

  const handleUpKey = value => {
    const step = getStep();
    setAdjustedValue(value + step);
  };

  const handleDownButton = event => {
    const step = getStep();

    event.preventDefault();

    const {value = 0} = props;

    setAdjustedValue(parseFloat(value) - step);
  };

  const handleDownKey = value => {
    const step = getStep();
    setAdjustedValue(value - step);
  };

  const handleMouseWheel = event => {
    const direction = event.deltaY > 1 ? 1 : -1;
    const step = getStep();

    event.preventDefault();

    const {value = 0} = props;

    setAdjustedValue(parseFloat(value) + step * direction);
  };

  const handleDbClick = event => {
    event.preventDefault();
  };

  let notifyChange;

  notifyChange = value => {
    const {onChange, name, disabled = false} = props;

    if (!disabled && onChange) {
      onChange(value, name);
    }
  };

  const debounceValue = parseInt(props.debounce);

  if (isDefined(debounceValue) && debounceValue > 0) {
    notifyChange = debounce(notifyChange, debounceValue);
  }

  const setAdjustedValue = value => {
    const step = getStep();
    const {min = 0, disabled} = props;

    if (disabled) {
      return;
    }

    const base = parseFloat(min);

    let aboveMin = value - base;

    // - round to the nearest step
    aboveMin = Math.round(aboveMin / step) * step;

    // - rounding is based on 0, so adjust back to our base
    value = base + aboveMin;

    // Fix precision from bad JS floating point math
    value = parseFloat(fixedValue(value, getPrecision()));

    setValue(value);
  };

  const setValue = value => {
    let {min, max} = props;

    min = parseFloat(min);
    max = parseFloat(max);

    if (isDefined(value)) {
      if (isDefined(max) && value > max) {
        value = max;
      }
      if (isDefined(min) && value < min) {
        value = min;
      }

      notifyChange(value);
    }
  };

  const getPrecision = () => {
    const {precision = 0} = props;
    const step = getStep();

    return Math.max(precision, precisionOf(step));
  };

  const {value = 0} = props;
  const {size, type, min, max, disabled, maxLength, name} = props;
  const precision = getPrecision();
  return (
    <StyledSpinner disabled={disabled} onWheel={handleMouseWheel}>
      <StyledInput
        data-testid="spinner-input"
        type={type}
        min={min}
        max={max}
        name={name}
        size={size}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        precision={precision}
        onChange={notifyChange}
        onUpKeyPressed={handleUpKey}
        onDownKeyPressed={handleDownKey}
      />
      <SpinnerButtonUp
        data-testid="spinner-up"
        disabled={disabled}
        onClick={disabled ? undefined : handleUpButton}
        onDoubleClick={handleDbClick}
      >
        ▲
      </SpinnerButtonUp>
      <SpinnerButtonDown
        data-testid="spinner-down"
        disabled={disabled}
        onClick={disabled ? undefined : handleDownButton}
        onDoubleClick={handleDbClick}
      >
        ▼
      </SpinnerButtonDown>
    </StyledSpinner>
  );
};

SpinnerComponent.defaultProps = {
  size: 4,
  maxLength: 5,
  type: 'int',
};

SpinnerComponent.propTypes = {
  className: PropTypes.string,
  debounce: PropTypes.numberOrNumberString,
  disabled: PropTypes.bool,
  max: PropTypes.numberOrNumberString,
  maxLength: PropTypes.numberOrNumberString,
  min: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  precision: PropTypes.number,
  size: PropTypes.numberOrNumberString,
  step: PropTypes.numberOrNumberString,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default withLayout()(SpinnerComponent);

// vim: set ts=2 sw=2 tw=80:
