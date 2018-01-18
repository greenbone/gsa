/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import Select from 'web/components/form/select.js';

const Sizer = glamorous.div({
  width: '300px',
});

class ControlledSingleSelect extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {value: 'ipsum'};

    this.handleChange = this.handleChange.bind(this);
    this.action = action('state change');
  }

  handleChange(...args) {
    this.action(...args);
    const [value] = args;
    this.setState({value});
  }

  render() {
    const {value} = this.state;
    return (
      <Sizer>
        <Select
          value={value}
          onChange={this.handleChange}
        >
          <option value="foo">Foo</option>
          <option value="bar">Bar</option>
          <option value="lore">Lore</option>
          <option value="ipsum">Ipsum</option>
        </Select>
      </Sizer>
    );
  }
}


storiesOf('Select', module)
  .add('with options', () => (
    <Sizer>
      <Select
        onChange={action('select value change')}
      >
        <option>Foo</option>
        <option>Bar</option>
      </Select>
    </Sizer>
  ))
  .add('with options (value and label)', () => (
    <Sizer>
      <Select
        onChange={action('select value change')}
      >
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
        <option value="lore">Lore</option>
        <option value="ipsum">Ipsum</option>
      </Select>
    </Sizer>
  ))
  .add('with controlled input', () => (
    <ControlledSingleSelect/>
  ))
  .add('disabled controlled input', () => (
    <Sizer>
      <Select
        value="bar"
        disabled={true}
        onChange={action('select value change')}
      >
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
        <option value="lore">Lore</option>
        <option value="ipsum">Ipsum</option>
      </Select>
    </Sizer>
  ));

// vim: set ts=2 sw=2 tw=80:
