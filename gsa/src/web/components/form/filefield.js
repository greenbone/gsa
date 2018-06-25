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

import PropTypes from '../../utils/proptypes.js';

import {withLayout} from '../layout/layout.js';

class FileFieldComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const {onChange, name} = this.props;

    event.preventDefault();

    if (onChange) {
      onChange(event.target.files[0], name);
    }
  }

  render() {
    const {
      onChange,
      ...props
    } = this.props;
    return (
      <input
        {...props}
        type="file"
        onChange={this.handleChange}
      />
    );
  }
}

FileFieldComponent.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout(FileFieldComponent);

// vim: set ts=2 sw=2 tw=80:
