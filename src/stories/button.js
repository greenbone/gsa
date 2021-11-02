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
import Button from '../web/components/form/button';

class TestButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Light Switch',
      notification: 'Light off',
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(value, name) {
    if (this.state.notification === 'Light off') {
      this.setState({
        notification: 'Light on',
      });
    } else {
      this.setState({
        notification: 'Light off',
      });
    }
  }

  render() {
    return (
      <div>
        <Button title={this.state.title} onClick={this.handleClick} />
        <h3>{this.state.notification}</h3>
      </div>
    );
  }
}

storiesOf('Button', module)
  .add('default', () => <Button title="Button" />)
  .add('disabled', () => <Button title="Button" disabled={true} />)
  .add('with click event', () => <TestButton />);
