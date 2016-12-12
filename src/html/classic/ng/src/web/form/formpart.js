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

import {is_defined} from '../../utils.js';

export class FormPart extends React.Component {

  constructor(props, data_name) {
    super(props);

    this.onValueChange = this.onValueChange.bind(this);

    this.state = this.defaultState();
    this.data_name = data_name;
  }

  defaultState() {
    return undefined;
  }

  notify() {
    let {onDataChange, dataName} = this.props;
    let name = is_defined(this.data_name) ? this.data_name : dataName;

    if (onDataChange) {
      onDataChange(this.state, name);
    }
  }

  onValueChange(value, value_name) {
    let state = this.state;
    state[value_name] = value;

    this.setState(state);
    this.notify();
  }
}

FormPart.propTypes = {
  dataName: React.PropTypes.string,
  onDataChange: React.PropTypes.func,
  data: React.PropTypes.object,
  notify: React.PropTypes.bool,
};

export default FormPart;

// vim: set ts=2 sw=2 tw=80:

