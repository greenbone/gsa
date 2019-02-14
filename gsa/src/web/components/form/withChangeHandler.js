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

import React from 'react';

import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';

export const noop_convert = value => value;

export const target_value = event => event.target.value;

const withChangeHandler = (options = {}) => Component => {
  const {convert_func = noop_convert, value_func = target_value} = options;

  class ChangeHandler extends React.Component {
    constructor(...args) {
      super(...args);

      this.state = {
        value: this.props.value,
      };

      this.handleChange = this.handleChange.bind(this);

      const debounce_value = parseInt(this.props.debounce);

      if (isDefined(debounce_value) && debounce_value > 0) {
        this.notifyChange = debounce(this.notifyChange, debounce_value);
      }
    }

    componentWillReceiveProps(next) {
      const {value} = this.state;

      // we may be an uncontrolled input
      // https://facebook.github.io/react/docs/uncontrolled-components.html
      if (!isDefined(next.value)) {
        return;
      }

      const new_value = this.convertValue(next.value);

      if (new_value !== value) {
        this.setState({value: new_value});
      }
    }

    convertValue(value) {
      const {convert = convert_func} = this.props;
      const props = this.getOtherProps();

      return convert(value, props);
    }

    notifyChange(value) {
      const {disabled = false, name, onChange} = this.props;

      if (isDefined(onChange) && !disabled) {
        onChange(value, name);
      }
    }

    getOtherProps() {
      const {
        convert = convert_func, // eslint-disable-line no-unused-vars
        debounce: debounce_value,
        ...props
      } = this.props;

      return props;
    }

    handleChange(event) {
      const value = this.convertValue(value_func(event, this.getOtherProps()));

      this.setState({value});

      this.notifyChange(value);
    }

    render() {
      const props = this.getOtherProps();
      const {value} = this.state;
      return (
        <Component {...props} value={value} onChange={this.handleChange} />
      );
    }
  }

  ChangeHandler.propTypes = {
    convert: PropTypes.func,
    debounce: PropTypes.numberOrNumberString,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
  };

  return ChangeHandler;
};

export default withChangeHandler;

// vim: set ts=2 sw=2 tw=80:
