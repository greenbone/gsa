
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

import {is_defined, debounce} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

export const noop_convert = value => value;

export const target_value = event => event.target.value;

const withChangeHandler = (options = {}) => Component => {
  const {
    convert_func = noop_convert,
    value_func = target_value,
  } = options;

  class ChangeHandler extends React.Component {

    constructor(...args) {
      super(...args);

      this.state = {};

      this.handleChange = this.handleChange.bind(this);

      if (is_defined(this.props.debounce) && this.props.debounce > 0) {
        this.notifyChange = debounce(this.notifyChange, this.props.debounce);
      }
    }

    componentWillReceiveProps(next) {
      const {value} = this.state;

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
      const {name, onChange} = this.props;

      if (is_defined(onChange)) {
        onChange(value, name);
      }
    }

    getOtherProps() {
      const {
        convert = convert_func, // eslint-disable-line no-unused-vars
        debounce: debounce_func,
        ...props,
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
      return (
        <Component
          {...props}
          onChange={this.handleChange}
        />
      );
    }
  }

  ChangeHandler.propTypes = {
    convert: PropTypes.func,
    debounce: PropTypes.number,
    name: PropTypes.string,
    onChange: PropTypes.func,
  };

  return ChangeHandler;
};

export default withChangeHandler;

// vim: set ts=2 sw=2 tw=80:
