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

import {classes, is_defined} from '../../utils.js';
import logger from '../../log.js';

import FormItem from './formitem.js';

import './css/form.css';
import './css/checkboxradio.css';

const log = logger.getLogger('web.form.radio');

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
    let {title, children, className, disabled, ...other} = this.props;

    className = classes(className, 'radio', disabled ? 'disabled' : '');

    return (
      <div className={className}>
        <label>
          <input {...other} type="radio" onChange={this.handleChange}/>
          {is_defined(title) &&
            <span>
              {title}
            </span>
          }
          {children}
        </label>
      </div>
    );
  }
}

Radio.propTypes = {
  name: React.PropTypes.string,
  className: React.PropTypes.string,
  disabled: React.PropTypes.bool,
  title: React.PropTypes.string,
  onChange: React.PropTypes.func,
};

/* RadioInline should not be used anymore */
export class RadioInline extends Radio {

  constructor(...args) {
    super(...args);

    log.warn('RadioInline is deprecated. Please use Radio with ' +
      'className="inline" instead.');
  }

  render() {
    let {title, children, disabled, ...other} = this.props;

    let css = classes('radio-inline', disabled ? 'disabled' : '');

    return (
      <label className={css}>
        <input {...other} type="radio"
          onChange={this.handleChange}/>
        {is_defined(title) &&
          <span>
            {title}
          </span>
        }
        {children}
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
            <span>
              {title}
            </span>
          </label>
        </FormItem>
        {children}
      </div>
    );
  }
}

export default Radio;

// vim: set ts=2 sw=2 tw=80:
