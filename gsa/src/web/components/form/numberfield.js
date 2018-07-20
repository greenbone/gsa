/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import {parseFloat} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

const displayValue = (value, precision) => isDefined(precision) ?
  value.toFixed(precision) :
  value;

class NumberInput extends React.Component {

  constructor(...args) {
    super(...args);

    const {value, type, precision} = this.props;

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

    const displayedValue = displayValue(value, precision);

    this.state = {
      displayedValue: displayedValue,
      lastValidValue: value,
      prevValue: value,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {value, precision} = props;
    if (value !== state.prevValue) {
      const displayedValue = displayValue(value, precision);
      return {
        prevValue: value,
        displayedValue,
        lastValidValue: value,
      };
    }
    return null;
  }

  notifyChange(value) {
    const {onChange, name, disabled = false} = this.props;

    if (!disabled && onChange && isDefined(value)) {
      onChange(value, name);
    }
  }

  handleChange(event) {
    let {min = 0, max} = this.props;
    const {disabled = false} = this.props;
    const {value} = event.target;

    if (disabled) {
      return;
    }

    const parsedValue = parseFloat(value);
    min = parseFloat(min);
    max = parseFloat(max);

    const update = isDefined(parsedValue) && parsedValue <= max &&
     parsedValue >= min;

    if (update) {
      this.setState({
        displayedValue: value,
        lastValidValue: parsedValue,
        prevValue: parsedValue,
      });

      this.notifyChange(parsedValue);
    }
    else {
      this.setState({displayedValue: value});
    }
  }

  handleBlur() {
    let {min = 0, max} = this.props;
    const {precision} = this.props;
    const {lastValidValue, displayedValue} = this.state;

    min = parseFloat(min);
    max = parseFloat(max);

    let parsedValue = parseFloat(displayedValue);

    if (isDefined(parsedValue)) {
      if (parsedValue > max) {
        parsedValue = max;
      }
      else if (parsedValue < min) {
        parsedValue = min;
      }

      const newDisplayedValue = displayValue(parsedValue, precision);

      this.setState({
        displayedValue: newDisplayedValue,
        lastValidValue: parsedValue,
      });
    }
    else {
      this.setState({displayedValue: displayValue(lastValidValue, precision)});
    }
  }

  handleDown() {
    const {name, onDownKeyPressed} = this.props;
    const {lastValidValue: value} = this.state;

    if (isDefined(onDownKeyPressed)) {
      onDownKeyPressed(value, name);
    }
  }

  handleUp() {
    const {name, onUpKeyPressed} = this.props;
    const {lastValidValue: value} = this.state;

    if (isDefined(onUpKeyPressed)) {
      onUpKeyPressed(value, name);
    }
  }

  handleKeyDown(event) {
    const {keyCode} = event;

    // '9' == keycode 57 and 105 on numpad
    // '0' == keycode 48 and 96 on numpad
    // umlauts seems to have keycode 0
    if ((keyCode <= 0 || (keyCode > 57 && keyCode < 96) || keyCode > 105 ||
      this.disallowed.includes(keyCode)) &&
      !this.allowed.includes(keyCode) && !event.ctrlKey) {
        event.preventDefault();
        return;
    }

    switch (keyCode) {
      case KeyCode.UP:
      case KeyCode.PAGE_UP:
        event.preventDefault();
        this.handleUp();
        return;
      case KeyCode.DOWN:
      case KeyCode.PAGE_DOWN:
        event.preventDefault();
        this.handleDown();
        return;
      case KeyCode.ENTER:
        event.preventDefault();
        this.handleBlur();
        return;
      default:
        break;
    }
  }

  render() {
    const {
      precision,
      type,
      onChange,
      onDownKeyPressed,
      onUpKeyPressed,
      ...props
    } = this.props;
    const {displayedValue} = this.state;
    return (
      <input
        {...props}
        value={displayedValue}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}

NumberInput.propTypes = {
  disabled: PropTypes.bool,
  max: PropTypes.numberOrNumberString,
  min: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  precision: PropTypes.number,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.number,
  onChange: PropTypes.func,
  onDownKeyPressed: PropTypes.func,
  onUpKeyPressed: PropTypes.func,
};

export default NumberInput;

// vim: set ts=2 sw=2 tw=80:
