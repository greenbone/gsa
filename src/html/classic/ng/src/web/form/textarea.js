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

import {classes} from '../../utils.js';

import {withLayout} from '../layout.js';

import {handle_change} from './form.js';

const TextAreaComponent =
  ({className, value = '', onChange, name, ...props}) => {
  className = classes('form-control', className);
  return (
    <textarea {...props}
      value={value}
      className={className}
      onChange={event => handle_change({event, on_change: onChange, name})}/>
  );
};

TextAreaComponent.propTypes = {
  className: React.PropTypes.string,
  name: React.PropTypes.string,
  value: React.PropTypes.any,
  onChange: React.PropTypes.func,
};

export const TextArea = withLayout(TextAreaComponent, {box: true});

export default TextArea;

// vim: set ts=2 sw=2 tw=80:
