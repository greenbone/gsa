/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/array/includes';

import React from 'react';

import styled from 'styled-components';

import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import {fixedValue} from 'gmp/utils/number';

import {parseFloat, parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import withLayout from '../layout/withLayout';

import NumberField from './numberfield';

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

class SpinnerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      upActive: false,
      downActive: false,
    };

    this.handleDbClick = this.handleDbClick.bind(this);
    this.handleDownButton = this.handleDownButton.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleUpButton = this.handleUpButton.bind(this);
    this.notifyChange = this.notifyChange.bind(this);
    this.handleDownKey = this.handleDownKey.bind(this);
    this.handleUpKey = this.handleUpKey.bind(this);

    const debounce_value = parseInt(this.props.debounce);

    if (isDefined(debounce_value) && debounce_value > 0) {
      this.notifyChange = debounce(this.notifyChange, debounce_value);
    }
  }

  getStep() {
    const {step, type} = this.props;

    if (isDefined(step)) {
      return parseFloat(step);
    }
    return type === 'float' ? 0.1 : 1;
  }

  handleUpButton(event) {
    const step = this.getStep();

    event.preventDefault();

    const {value = 0} = this.props;

    this.setAdjustedValue(parseFloat(value) + step);
  }

  handleUpKey(value) {
    const step = this.getStep();
    this.setAdjustedValue(value + step);
  }

  handleDownButton(event) {
    const step = this.getStep();

    event.preventDefault();

    const {value = 0} = this.props;

    this.setAdjustedValue(parseFloat(value) - step);
  }

  handleDownKey(value) {
    const step = this.getStep();
    this.setAdjustedValue(value - step);
  }

  handleMouseWheel(event) {
    const direction = event.deltaY > 1 ? 1 : -1;
    const step = this.getStep();

    event.preventDefault();

    const {value = 0} = this.props;

    this.setAdjustedValue(parseFloat(value) + step * direction);
  }

  handleDbClick(event) {
    event.preventDefault();
  }

  notifyChange(value) {
    const {onChange, name, disabled = false} = this.props;

    if (!disabled && onChange) {
      onChange(value, name);
    }
  }

  setAdjustedValue(value) {
    const step = this.getStep();
    const {min = 0, disabled} = this.props;

    if (disabled) {
      return;
    }

    const base = parseFloat(min);

    let above_min = value - base;

    // - round to the nearest step
    above_min = Math.round(above_min / step) * step;

    // - rounding is based on 0, so adjust back to our base
    value = base + above_min;

    // Fix precision from bad JS floating point math
    value = parseFloat(fixedValue(value, this.getPrecision()));

    this.setValue(value);
  }

  setValue(value) {
    let {min, max} = this.props;

    min = parseFloat(min);
    max = parseFloat(max);

    if (isDefined(value)) {
      if (isDefined(max) && value > max) {
        value = max;
      }
      if (isDefined(min) && value < min) {
        value = min;
      }

      this.notifyChange(value);
    }
  }

  getPrecision() {
    const {precision = 0} = this.props;
    const step = this.getStep();

    return Math.max(precision, this.precisionOf(step));
  }

  precisionOf(num) {
    const str = num.toString();
    const decimal = str.indexOf('.');

    return decimal === -1 ? 0 : str.length - decimal - 1;
  }

  render() {
    const {value = 0} = this.props;
    const {size, type, min, max, disabled, maxLength, name} = this.props;
    const precision = this.getPrecision();
    return (
      <StyledSpinner disabled={disabled} onWheel={this.handleMouseWheel}>
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
          onChange={this.notifyChange}
          onUpKeyPressed={this.handleUpKey}
          onDownKeyPressed={this.handleDownKey}
        />
        <SpinnerButtonUp
          data-testid="spinner-up"
          disabled={disabled}
          onClick={disabled ? undefined : this.handleUpButton}
          onDoubleClick={this.handleDbClick}
        >
          ▲
        </SpinnerButtonUp>
        <SpinnerButtonDown
          data-testid="spinner-down"
          disabled={disabled}
          onClick={disabled ? undefined : this.handleDownButton}
          onDoubleClick={this.handleDbClick}
        >
          ▼
        </SpinnerButtonDown>
      </StyledSpinner>
    );
  }
}

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
