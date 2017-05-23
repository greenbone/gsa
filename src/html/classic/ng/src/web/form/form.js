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

import PropTypes from '../proptypes.js';

export const noop_convert = value => value;

export const target_value = event => event.target.value;
export const props_value = (event, props) => props.value;

export const withChangeHandler = (
    Component,
    options = {},
  ) => {
  const {
    convert_func = noop_convert,
    value_func = target_value,
  } = options;

  const ChangeHandler = ({onChange, convert = convert_func, ...props}) => {

    const handleChange = event => {
      if (onChange) {
        onChange(convert(value_func(event, props), props), props.name);
      }
    };

    return <Component {...props} onChange={handleChange}/>;
  };

  ChangeHandler.propTypes = {
    convert: PropTypes.func,
    name: PropTypes.string,
    onChange: PropTypes.func,
  };

  return ChangeHandler;
};

export const withClickHandler = (
    Component,
    options = {},
  ) => {
  const {
    convert_func = noop_convert,
    value_func = props_value,
  } = options;

  const ClickHandler = ({onClick, convert = convert_func, ...props}) => {

    const handleClick = event => {
      if (onClick) {
        onClick(convert(value_func(event, props), props), props.name);
      }
    };

    return <Component {...props} onClick={handleClick}/>;
  };

  ClickHandler.propTypes = {
    convert: PropTypes.func,
    name: PropTypes.string,
    onClick: PropTypes.func,
  };

  return ClickHandler;
};

// vim: set ts=2 sw=2 tw=80:
