/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import withLayout from 'web/components/layout/withLayout';

import PropTypes from 'web/utils/proptypes';

class FileFieldComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const {onChange, disabled, name} = this.props;

    event.preventDefault();

    if (!disabled && isDefined(onChange)) {
      onChange(event.target.files[0], name);
    }
  }

  render() {
    const {onChange, ...props} = this.props;
    return <input {...props} type="file" onChange={this.handleChange} />;
  }
}

FileFieldComponent.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout()(FileFieldComponent);

// vim: set ts=2 sw=2 tw=80:
