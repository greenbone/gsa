/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

export function handle_value_change({value, on_change, conversion, name}) {
  if (on_change) {
    if (conversion) {
      on_change(conversion(value), name);
    }
    else {
      on_change(value, name);
    }
  }
}

export function handle_change({event, on_change, conversion, name}) {
  handle_value_change({value: event.target.value, on_change, conversion, name});
}

const noop_convert = value => value;
const value_name = event => event.target.name;

export const withChangeHandler = (Component, convert_func = noop_convert,
  value_func = value_name) => {

  const ChangeHandler = ({onChange, convert = convert_func, ...props}) => {

    const handleChange = event => {
      if (onChange) {
        onChange(convert(value_func(event), props), props.name);
      }
    };

    return <Component {...props} onChange={handleChange}/>;
  };

  ChangeHandler.propTypes = {
    convert: React.PropTypes.func,
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
  };

  return ChangeHandler;
};

// vim: set ts=2 sw=2 tw=80:
