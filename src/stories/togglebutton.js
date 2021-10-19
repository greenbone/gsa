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
import ToggleButton from '../web/components/form/togglebutton';

class TestToggleButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      disabled: this.props.disabled,
      checked: this.props.checked,
      value: '',
      text: '',
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle(value, name) {
    this.setState({
      value: value,
      text: value,
      checked: !this.state.checked,
    });
  }

  render() {
    let text = '';
    if (this.state.text === true) {
      text = 'Light on';
    } else {
      text = 'Light off';
    }
    return (
      <div>
        <ToggleButton
          name={this.state.name}
          disabled={this.state.disabled}
          value={this.state.value}
          onToggle={this.handleToggle}
          checked={this.state.checked}
        />
        <h3>{text}</h3>
      </div>
    );
  }
}

storiesOf('ToggleButton', module)
  .add('default', () => <ToggleButton title="Button" />)
  .add('disabled', () => <ToggleButton disabled={true} />)
  .add('checked', () => <ToggleButton checked={true} />)
  .add('with change event', () => (
    <TestToggleButton name="toggle1" disabled={false} checked={false} />
  ));
