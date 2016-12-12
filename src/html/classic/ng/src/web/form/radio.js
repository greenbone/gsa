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

import FormItem from './formitem.js';

import './css/form.css';
import './css/checkboxradio.css';

export class Radio extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let {onChange, name} = this.props;

    if (onChange) {
      onChange(event.target.value, name);
    }
  }

  render() {
    let {title, children, ...other} = this.props;
    title = title ? title : children;

    return (
      <div className="radio">
        <label>
          <input {...other} type="radio" onChange={this.handleChange}/>
          {title}
        </label>
      </div>
    );
  }
}

Radio.propTypes = {
  name: React.PropTypes.string,
  title: React.PropTypes.string,
  onChange: React.PropTypes.func,
};

export class RadioInline extends Radio {

  render() {
    let {title, children, ...other} = this.props;
    title = title ? title : children;

    return (
      <label className="radio-inline">
        <input {...other} type="radio"
          onChange={this.handleChange}/>
        {title}
      </label>
    );
  }
}

export class RadioFormItem extends Radio {

  render() {
    let {title, children, ...other} = this.props;

    return (
      <div className="radio">
        <FormItem>
          <label>
            <input {...other} type="radio" onChange={this.handleChange}/>
            {title}
          </label>
        </FormItem>
        {children}
      </div>
    );
  }
}

export default Radio;

// vim: set ts=2 sw=2 tw=80:
