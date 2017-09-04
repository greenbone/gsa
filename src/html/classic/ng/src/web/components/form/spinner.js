/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import React from 'react';

import {
  classes,
  debounce,
  includes,
  is_defined,
  KeyCode,
} from 'gmp/utils.js';

import {parse_float, parse_int} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';

import withLayout from '../layout/withLayout.js';

import './css/spinner.css';

class SpinnerComponent extends React.Component {

  constructor(props) {
    super(props);

    const {step, value, type} = this.props;
    if (is_defined(step)) {
      this.step = parse_float(step);
    }
    else {
      this.step = type === 'float' ? 0.1 : 1;
    }

    this.value = parse_float(value || 0);

    this.allowed = [
      KeyCode.SUBTRACT,
      KeyCode.MINUS,
    ];

    if (type === 'float') {
      this.allowed.push(KeyCode.PERIOD);
    }

    this.disallowed = [
      KeyCode.SPACE,
    ];

    this.state = {
      value,
      up_active: false,
      down_active: false,
    };

    this.handleBlur = this.handleBlur.bind(this);
    this.handleDbClick = this.handleDbClick.bind(this);
    this.handleDownMouse = this.handleDownMouse.bind(this);
    this.handleDown = this.handleDown.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleUpMouse = this.handleUpMouse.bind(this);
    this.handleChange = this.handleChange.bind(this);

    const debounce_value = parse_int(this.props.debounce);

    if (is_defined(debounce_value) && debounce_value > 0) {
      this.notifyChange = debounce(this.notifyChange, debounce_value);
    }
  }

  componentWillReceiveProps(new_props) {
    const new_value = parse_float(new_props.value);

    if (new_value !== this.state.value) {
      this.setState({value: new_value});
    }
  }

  handleBlur(event) {
    const {value} = event.target;
    this.setValue(value);
  }

  handleUp(event) {
    const {value, step} = this;

    event.preventDefault();

    this.setAdjustedValue(value + step);
  }

  handleDown(event) {
    const {value, step} = this;

    event.preventDefault();

    this.setAdjustedValue(value - step);
  }

  handleKeyDown(event) {
    const key_code = event.keyCode;
    const {allowed, disallowed} = this;

    // '9' == keycode 57 and 105 on numpad
    // '0' == keycode 48 and 96 on numpad
    // umlauts seems to have keycode 0
    if ((key_code <= 0 || (key_code > 57 && key_code < 96) || key_code > 105 ||
      includes(disallowed, key_code)) &&
      !includes(allowed, key_code) && !event.ctrlKey) {
        event.preventDefault();
        return;
    }

    switch (key_code) {
      case KeyCode.UP:
      case KeyCode.PAGE_UP:
        this.handleUp(event);
        return;
      case KeyCode.DOWN:
      case KeyCode.PAGE_DOWN:
        this.handleDown(event);
        return;
      case KeyCode.ENTER:
        this.notifyChange(this.state.value);
        return;
      default:
        break;
    }
  }

  handleChange(event) {
    if (this.props.disabled) {
      return;
    }

    const value = parse_float(event.target.value);

    this.setState({value});
  }

  handleMouseWheel(event) {
    const {step} = this;
    const direction = event.deltaY > 1  ? 1 : -1;

    event.preventDefault();

    this.setAdjustedValue(this.state.value + (step * direction));
  }

  handleDbClick(event) {
    event.preventDefault();
  }

  handleDownMouse(event) {
    this.setState({down_active: !this.state.down_active});

    event.preventDefault();
  }

  handleUpMouse(event) {
    this.setState({up_active: !this.state.up_active});

    event.preventDefault();
  }

  notifyChange(value) {
    const {onChange, name} = this.props;

    if (onChange) {
      onChange(value, name);
    }
  }

  setAdjustedValue(value) {
    const {step} = this;
    const {min, disabled} = this.props;

    if (disabled) {
      return;
    }

    const base = is_defined(min) ? parse_float(min) : 0;

    let above_min = value - base;

    // - round to the nearest step
    above_min = Math.round(above_min / step) * step;

    // - rounding is based on 0, so adjust back to our base
    value = base + above_min;

    // Fix precision from bad JS floating point math
    value = parse_float(value.toFixed(this.getPrecision()));

    this.setValue(value);
  }

  setValue(value) {
    const {disabled} = this.props;
    let {min, max} = this.props;

    if (disabled) {
      return;
    }

    value = parse_float(value);
    min = parse_float(min);
    max = parse_float(max);

    if (isNaN(value)) {
      value = this.value; // reset to last valid value;
    }
    else {
      if (is_defined(max) && value > max) {
        value = max;
      }
      if (is_defined(min) && value < min) {
        value = min;
      }

      this.value = value;

      this.notifyChange(value);
    }

    this.setState({value});
  }

  getPrecision() {
    const {step} = this;
    let precision = this.precisionOf(step);

    precision = Math.max(precision, this.precisionOf(step));

    return precision;
  }

  precisionOf(num) {
    const str = num.toString();
    const decimal = str.indexOf(".");

    return decimal === -1 ? 0 : str.length - decimal - 1;
  }

  render() {
    const {value, down_active, up_active} = this.state;
    const {
      size,
      type,
      min,
      max,
      disabled,
      maxLength,
      name,
      className,
    } = this.props;

    const css = classes(disabled ? 'spinner disabled' : 'spinner', className);

    return (
      <span className={css}
        onWheel={this.handleMouseWheel}>
        <input className="spinner-input"
          data-type={type}
          min={min}
          max={max}
          type="text" name={name}
          value={value}
          disabled={disabled}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          size={size} maxLength={maxLength}>
        </input>
        <a className={classes('spinner-button spinner-up',
          up_active ? ' active' : '')}
          onClick={this.handleUp}
          onMouseDown={this.handleUpMouse}
          onMouseUp={this.handleUpMouse}
          onDoubleClick={this.handleDbClick}>
          ▲
        </a>
        <a className={classes('spinner-button spinner-down',
          down_active ? ' active' : '')}
          onClick={this.handleDown}
          onMouseDown={this.handleDownMouse}
          onMouseUp={this.handleDownMouse}
          onDoubleClick={this.handleDbClick}>
          ▼
        </a>
      </span>
    );
  }
}

SpinnerComponent.defaultProps = {
  size: 4,
  maxLenght: 5,
  type: 'int',
};

SpinnerComponent.propTypes = {
  className: PropTypes.string,
  debounce: PropTypes.numberOrNumberString,
  disabled: PropTypes.bool,
  maxLength: PropTypes.numberOrNumberString,
  max: PropTypes.numberOrNumberString,
  min: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  size: PropTypes.numberOrNumberString,
  step: PropTypes.numberOrNumberString,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.numberOrNumberString,
  onChange: PropTypes.func,
};

export default withLayout()(SpinnerComponent);

// vim: set ts=2 sw=2 tw=80:
