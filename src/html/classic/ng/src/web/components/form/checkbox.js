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

import {classes, is_defined} from '../../../utils.js';

import PropTypes from '../../proptypes.js';
import {withLayout} from '../layout/layout.js';

import {withChangeHandler} from './form.js';

import './css/form.css';
import './css/checkboxradio.css';

const convert_checked = (value, props) => {
  let {checkedValue, unCheckedValue} = props;

  if (value && is_defined(checkedValue)) {
    value = checkedValue;
  }
  else if (!value && is_defined(unCheckedValue)) {
    value = unCheckedValue;
  }
  return value;
};

const CheckboxComponent = ({
    title,
    className,
    children,
    disabled,
    checkedValue,
    unCheckedValue,
    ...other,
  }) => {

  className = classes(className, 'checkbox', disabled ? 'disabled' : '');

  return (
    <div className={className}>
      <label>
        <input {...other} type="checkbox" />
        {is_defined(title) &&
          <span>
            {title}
          </span>
        }
        {children}
      </label>
    </div>
  );
};

CheckboxComponent.propTypes = {
  name: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  checkedValue: PropTypes.any,
  unCheckedValue: PropTypes.any,
};

export default withLayout(
  withChangeHandler(CheckboxComponent, {
    convert_func: convert_checked,
    value_func: event => event.target.checked,
  }),
  {box: true}
);

// vim: set ts=2 sw=2 tw=80:
