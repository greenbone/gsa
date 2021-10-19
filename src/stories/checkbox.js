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
import CheckboxComponent from '../web/components/form/checkbox';

class TestCheckbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: '',
      check1: false,
      check2: false,
      check3: false,
      value1: 'coffee',
      value2: 'tea',
      value3: 'water',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    if (name === 'check1') {
      this.setState(state => ({
        check1: !this.state.check1,
      }));
    } else if (name === 'check2') {
      this.setState(state => ({
        check2: !this.state.check2,
      }));
    } else if (name === 'check3') {
      this.setState(state => ({
        check3: !this.state.check3,
      }));
    }
  }

  render() {
    let text = 'You chose ';
    if (this.state.check1) {
      text = text + ' ' + this.state.value1;
    }
    if (this.state.check2) {
      text = text + ' ' + this.state.value2;
    }
    if (this.state.check3) {
      text = text + ' ' + this.state.value3;
    }
    return (
      <div>
        <ul>
          <li>
            Coffee
            <CheckboxComponent name="check1" onChange={this.handleChange} />
          </li>
          <li>
            Tea
            <CheckboxComponent name="check2" onChange={this.handleChange} />
          </li>
          <li>
            Water
            <CheckboxComponent name="check3" onChange={this.handleChange} />
          </li>
          <h3>{text}</h3>
        </ul>
      </div>
    );
  }
}

storiesOf('Checkbox', module)
  .add('default', () => <CheckboxComponent />)
  .add('checked', () => <CheckboxComponent defaultChecked={true} />)
  .add('disabled', () => <CheckboxComponent disabled={true} />)
  .add('with multiple options', () => (
    <div>
      <ul>
        <li>
          Coffee
          <CheckboxComponent name="check1" />
        </li>
        <li>
          Tea
          <CheckboxComponent name="check2" />
        </li>
        <li>
          Water
          <CheckboxComponent name="check3" />
        </li>
      </ul>
    </div>
  ))
  .add('with change event', () => <TestCheckbox />);
