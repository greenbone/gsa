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
import PasswordField from '../web/components/form/passwordfield';

class TestPasswordField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Title',
      notification: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    this.setState({
      notification: 'Your password must contain numbers and capital letters!',
    });
  }

  render() {
    return (
      <div>
        <PasswordField value="" onChange={this.handleChange} />
        <h3>{this.state.notification}</h3>
      </div>
    );
  }
}

storiesOf('PasswordField', module)
  .add('default', () => <PasswordField />)
  .add('disabled', () => <PasswordField disabled={true} />)
  .add('with change event', () => <TestPasswordField />);
