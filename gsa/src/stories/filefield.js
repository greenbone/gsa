/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

/* eslint-disable react/prop-types */
import React from 'react';
import {storiesOf} from '@storybook/react';
import FileFieldComponent from '../web/components/form/filefield';

class TestFileField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      disabled: this.props.disabled,
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    this.setState({
      value: value,
    });
  }

  render() {
    return (
      <div>
        <FileFieldComponent
          name={this.state.name}
          disabled={this.state.disabled}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

storiesOf('FileField', module)
  .add('default', () => <TestFileField />)
  .add('disabled', () => <TestFileField disabled={true} />);
