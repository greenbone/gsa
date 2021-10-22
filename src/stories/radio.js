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
import RadioComponent from '../web/components/form/radio';

class TestRadio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: '',
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    this.setState({
      value,
    });
  }

  render() {
    const text = 'You chose ' + this.state.value;
    return (
      <div>
        <ul>
          <li>
            Coffee
            <RadioComponent
              name="radio1"
              value="coffee"
              onChange={this.handleChange}
            />
          </li>
          <li>
            Tea
            <RadioComponent
              name="radio1"
              value="tea"
              onChange={this.handleChange}
            />
          </li>
          <li>
            Water
            <RadioComponent
              name="radio1"
              value="water"
              onChange={this.handleChange}
            />
          </li>
          <h3>{text}</h3>
        </ul>
      </div>
    );
  }
}

storiesOf('Radio', module)
  .add('default', () => <RadioComponent />)
  .add('checked', () => <RadioComponent defaultChecked="true" />)
  .add('disabled', () => <RadioComponent disabled={true} />)
  .add('multiple options', () => (
    <div>
      <ul>
        <li>
          Coffee
          <RadioComponent name="radio1" />
        </li>
        <li>
          Tea
          <RadioComponent name="radio1" />
        </li>
        <li>
          Water
          <RadioComponent name="radio1" />
        </li>
      </ul>
    </div>
  ))
  .add('with change event', () => <TestRadio />);
