/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

/* eslint-disable react/prop-types */
import React from 'react';
import {storiesOf} from '@storybook/react';
import SpinnerComponent from '../web/components/form/spinner';

class TestSpinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      disabled: this.props.disabled,
      min: this.props.min,
      value: 0,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    if (value < this.state.min) {
      this.setState({
        value: this.state.min,
      });
    } else {
      this.setState({
        value: value,
      });
    }
  }

  render() {
    return (
      <div>
        <SpinnerComponent
          name={this.state.name}
          disabled={this.state.disabled}
          value={this.state.value}
          onChange={this.handleChange}
          precision={this.props.precision}
          type={this.props.type}
        />
      </div>
    );
  }
}

storiesOf('Spinner', module)
  .add('default', () => <TestSpinner name="spinner0" />)
  .add('disabled', () => <TestSpinner name="spinner1" disabled={true} />)
  .add('with floats', () => (
    <TestSpinner name="spinner2" type="float" precision={2} />
  ))
  .add('without negative numbers', () => (
    <TestSpinner name="spinner3" min={0} />
  ));
