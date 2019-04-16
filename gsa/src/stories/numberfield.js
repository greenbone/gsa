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

import React from 'react';
import {storiesOf} from '@storybook/react';
import NumberField from '../web/components/form/numberfield';

class TestNumberField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    if (value > 10) {
      this.setState(state => ({
        notification: 'No numbers > 10 allowed!',
      }));
    } else {
      this.setState(state => ({
        notification: '',
      }));
    }
  }

  render() {
    return (
      <div>
        <NumberField value={0} onChange={this.handleChange} />
        <h3>{this.state.notification}</h3>
      </div>
    );
  }
}

storiesOf('NumberField', module)
  .add('default', () => <NumberField value={0} />)
  .add('disabled', () => <NumberField value={0} disabled={true} />)
  .add('with default value', () => <NumberField value={1234} />)
  .add('with numbers < 10', () => <NumberField max={10} value={0} />)
  .add('with change event', () => <TestNumberField />);
