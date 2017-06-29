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

import PropTypes from '../../utils/proptypes.js';

import {withLayout} from '../layout/layout.js';

import {withChangeHandler} from './form.js';

import './css/form.css';
import './css/checkboxradio.css';

const RadioComponent = ({title, children, className, disabled, ...other}) => {

  className = classes(className, 'radio', disabled ? 'disabled' : '');

  return (
    <div className={className}>
      <label>
        <input
          {...other}
          disabled={disabled}
          type="radio"
        />
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

RadioComponent.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout(withChangeHandler(RadioComponent),
  {align: ['start', 'center'], box: true, flex: true});

// vim: set ts=2 sw=2 tw=80:
