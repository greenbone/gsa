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

import {classes} from '../../utils.js';

import './css/form.css';
import './css/checkboxradio.css';

export class Checkbox extends React.Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let {checked} = event.target;
    let {onChange, name} = this.props;

    if (onChange) {
      onChange(checked, name);
    }
  }

  render() {
    let {title, className, ...other} = this.props;
    className = classes(className, 'checkbox');
    return (
      <div className={className}>
        <label>
          <input {...other} onChange={this.handleChange} type="checkbox" />
          {title}
        </label>
      </div>
    );
  }
}

Checkbox.propTypes = {
  name: React.PropTypes.string,
  title: React.PropTypes.string,
  className: React.PropTypes.string,
  onChange: React.PropTypes.func,
};

export default Checkbox;

// vim: set ts=2 sw=2 tw=80:
