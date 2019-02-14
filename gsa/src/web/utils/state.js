/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import PropTypes from './proptypes.js';

class State extends React.Component {
  constructor(...args) {
    super(...args);

    const {children, ...props} = this.props;

    this.state = {
      ...props,
    };

    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {children} = this.props;
    return children({state: this.state, onValueChange: this.handleValueChange});
  }
}

State.propTypes = {
  children: PropTypes.func.isRequired,
};

export default State;

// vim: set ts=2 sw=2 tw=80:
