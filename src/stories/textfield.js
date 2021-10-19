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

import React from 'react';
import {storiesOf} from '@storybook/react';
import TextField from '../web/components/form/textfield';

class TestTextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Title',
      length: 10,
      notification: '',
      color: 'black',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleInputLength = this.handleInputLength.bind(this);
  }

  handleChange(value, name) {
    this.setState({
      title: value,
    });

    this.handleInputLength(value, name);
  }

  handleInputLength(value, name) {
    if (value.length > this.state.length) {
      this.setState(state => ({
        notification: 'Error!',
        color: 'red',
      }));
    } else {
      const characters = this.state.length - value.length;
      const characters_left = characters + ' characters left';
      this.setState(state => ({
        notification: characters_left,
        color: 'black',
      }));
    }
  }

  render() {
    return (
      <div>
        <h1 id="title">{this.state.title}</h1>
        <TextField
          placeholder="Hello World"
          value={this.state.title}
          onChange={this.handleChange}
        />
        <h3 color={this.state.color}>{this.state.notification}</h3>
      </div>
    );
  }
}

storiesOf('TextField', module)
  .add('default', () => <TextField defaultValue="" />)
  .add('disabled', () => <TextField disabled={true} />)
  .add('with placeholder', () => <TextField placeholder="Hello World" />)
  .add('with default value', () => <TextField defaultValue="Hello World" />)
  .add('with change event', () => <TestTextField />);
