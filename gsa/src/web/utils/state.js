/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import PropTypes from './proptypes';

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
