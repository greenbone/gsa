/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import glamorous from 'glamorous';

import {debounce, is_defined, KeyCode} from 'gmp/utils';

import {parse_float, parse_int} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';

import Theme from '../../utils/theme.js';

import withLayout from '../layout/withLayout.js';

const StyledSpinner = glamorous.span({
  borderRadius: '4px',
  border: '1px solid ' + Theme.lightGray,
  backgroundColor: Theme.white,
  fontSize: '1.1em',
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  padding: 0,
  verticalAlign: 'middle',
},
  ({disabled}) => disabled ? {
    color: Theme.lightGray,
    cursor: 'not-allowed',
  } : undefined,
);

const StyledInput = glamorous.input({
  /* use font and line settings from parents not from browser default */
  fontamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',

  border: 'none',
  background: 'none',
  color: 'inherit',
  padding: 0,
  margin: '.2em 0',
  verticalAlign: 'middle',
  marginLeft: '.4em',
  marginRight: '22px',
});

const SpinnerButton = glamorous.span({
  backgroundColor: Theme.lightGreen,
  color: Theme.darkGreen,
  borderLeft: '1px solid ' + Theme.darkGreen,
  width: '16px',
  height: '50%',
  fontSize: '.6em',
  padding: 0,
  margin: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
  position: 'absolute',
  right: 0,
  cursor: 'default',
  display: 'block',
  overflow: 'hidden',
  textDecoration: 'none',
  userSelect: 'none', // don't select icon text on double click
},
  ({active}) => ({
    '&:hover': {
      backgroundColor: active ? Theme.white : Theme.darkGreen,
      color: active ? Theme.darkGreen : Theme.white,
      textDecoration: 'none',
    },
  }),
  ({disabled}) => disabled ? {
    color: Theme.mediumGray,
    background: Theme.lightGray,
    cursor: 'not-allowed',
    '&:hover': {
      color: Theme.mediumGray,
      background: Theme.lightGray,
      cursor: 'not-allowed',
    },
  } : undefined,
);

const SpinnerButtonUp = glamorous(SpinnerButton)({
  borderTopRightRadius: '3px',
  top: 0,
});

const SpinnerButtonDown = glamorous(SpinnerButton)({
  borderBottomRightRadius: '3px',
  bottom: 0,
});

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
      value_set: value, // external value for the outside world
      value, // internal value shown in the spinner
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

    if (new_value !== this.state.value_set) {
      // parent component has set a different value then before
      this.setState({
        value: new_value,
        value_set: new_value,
      });
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
      disallowed.includes(key_code)) &&
      !allowed.includes(key_code) && !event.ctrlKey) {
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
    const direction = event.deltaY > 1 ? 1 : -1;

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

    this.setState({
      value,
      value_set: value,
    });
  }

  getPrecision() {
    const {step} = this;
    let precision = this.precisionOf(step);

    precision = Math.max(precision, this.precisionOf(step));

    return precision;
  }

  precisionOf(num) {
    const str = num.toString();
    const decimal = str.indexOf('.');

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
    } = this.props;

    return (
      <StyledSpinner
        disabled={disabled}
        onWheel={this.handleMouseWheel}>
        <StyledInput
          data-type={type}
          min={min}
          max={max}
          type="text" name={name}
          value={value}
          disabled={disabled}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          size={size}
          maxLength={maxLength}
        >
        </StyledInput>
        <SpinnerButtonUp
          active={up_active}
          disabled={disabled}
          onClick={disabled ? undefined : this.handleUp}
          onMouseDown={this.handleUpMouse}
          onMouseUp={this.handleUpMouse}
          onDoubleClick={this.handleDbClick}
        >
          ▲
        </SpinnerButtonUp>
        <SpinnerButtonDown
          active={down_active}
          disabled={disabled}
          onClick={disabled ? undefined : this.handleDown}
          onMouseDown={this.handleDownMouse}
          onMouseUp={this.handleDownMouse}
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
  size: PropTypes.numberOrNumberString,
  step: PropTypes.numberOrNumberString,
  type: PropTypes.oneOf(['int', 'float']),
  value: PropTypes.numberOrNumberString,
  onChange: PropTypes.func,
};

export default withLayout()(SpinnerComponent);

// vim: set ts=2 sw=2 tw=80:
