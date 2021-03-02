/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {parseFloat} from 'gmp/parser';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import {fixedValue} from 'gmp/utils/number';

import PropTypes from 'web/utils/proptypes';

class NumberField extends React.Component {
  constructor(...args) {
    super(...args);

    const {value = 0, type, precision} = this.props;

    this.allowed = [KeyCode.SUBTRACT, KeyCode.MINUS];

    if (type === 'float') {
      this.allowed.push(KeyCode.PERIOD);
    }

    this.disallowed = [KeyCode.SPACE];

    const displayedValue = fixedValue(value, precision);

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
    const {value = 0, precision} = props;
    if (value !== state.prevValue) {
      if (value !== state.lastValidValue) {
        const displayedValue = fixedValue(value, precision);
        return {
          prevValue: value,
          displayedValue,
          lastValidValue: value,
        };
      }
      return {
        prevValue: value,
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
    max = isDefined(max) ? parseFloat(max) : Number.POSITIVE_INFINITY;

    const update =
      isDefined(parsedValue) && parsedValue <= max && parsedValue >= min;

    if (update) {
      this.setState({
        displayedValue: value,
        lastValidValue: parsedValue,
      });

      this.notifyChange(parsedValue);
    } else {
      this.setState({displayedValue: value});
    }
  }

  handleBlur() {
    let {min = 0, max} = this.props;
    const {precision} = this.props;
    const {lastValidValue, displayedValue} = this.state;

    min = parseFloat(min);
    max = isDefined(max) ? parseFloat(max) : Number.POSITIVE_INFINITY;

    let parsedValue = parseFloat(displayedValue);

    if (isDefined(parsedValue)) {
      if (parsedValue > max) {
        parsedValue = max;
      } else if (parsedValue < min) {
        parsedValue = min;
      }

      const newDisplayedValue = fixedValue(parsedValue, precision);

      this.setState({
        displayedValue: newDisplayedValue,
        lastValidValue: parsedValue,
      });
    } else {
      this.setState({displayedValue: fixedValue(lastValidValue, precision)});
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
    if (
      (keyCode <= 0 ||
        (keyCode > 57 && keyCode < 96) ||
        keyCode > 105 ||
        this.disallowed.includes(keyCode)) &&
      !this.allowed.includes(keyCode) &&
      !event.ctrlKey
    ) {
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

    const {onKeyDown} = this.props; // eslint-disable-line react/prop-types
    if (isDefined(onKeyDown)) {
      // should only be used for testing
      onKeyDown(event);
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

NumberField.propTypes = {
  disabled: PropTypes.bool,
  max: PropTypes.numberOrNumberString,
  min: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  precision: PropTypes.number,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  onDownKeyPressed: PropTypes.func,
  onUpKeyPressed: PropTypes.func,
};

export default NumberField;

// vim: set ts=2 sw=2 tw=80:
