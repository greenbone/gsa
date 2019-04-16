/* Copyright (C) 2019 Greenbone Networks GmbH
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
import TimeZoneSelectComponent from '../web/components/form/timezoneselect';

class TestTimeZoneSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      disabled: this.props.disabled,
      value: 'UTC',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    this.setState({
      value,
    });
  }

  render() {
    return (
      <div>
        <TimeZoneSelectComponent
          name={this.state.name}
          disabled={this.state.disabled}
          value={this.state.value}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

storiesOf('TimeZoneSelect', module).add('default', () => (
  <TestTimeZoneSelect />
));
