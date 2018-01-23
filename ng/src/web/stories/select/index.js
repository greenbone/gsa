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
import Divider from 'web/components/layout/divider.js';

import os from 'web/utils/os.js';

const Sizer = glamorous.div({
  width: '300px',
});

const Box = glamorous.div({
  width: '150px',
  height: '50px',
  border: '1px solid grey',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
});

const SelectBox = glamorous.div({
  width: '100px',
  border: '1px solid blue',
  padding: '5px',
});

const StyledSelect = glamorous(Select)({
  width: '120px',
  height: '30px',
});

const items = os.operating_systems.map(o => ({
  value: o.pattern,
  label: o.title,
}));

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


storiesOf('Form/Select', module)
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
  .add('with layout', () => (
    <Divider align={['start', 'center']}>
      <Box>Foo</Box>
      <Box>Lorem Ipsum</Box>
      <Box>Bar</Box>
      <Box>
        <SelectBox>
          <Select
            width="auto"
            onChange={action('select value change')}
          >
            <option value="foo">Foo</option>
            <option value="bar">Bar</option>
            <option value="lore">Lore</option>
            <option value="ipsum">Ipsum</option>
          </Select>
        </SelectBox>
      </Box>
      <Box>
        <StyledSelect
          items={items}
          onChange={action('select value change')}
        />
      </Box>
    </Divider>
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
  ))
  .add('with items and scrolling', () => (
    <Sizer>
      <Select
        items={items}
        onChange={action('select value change')}
      />
    </Sizer>
  ))
  .add('with menuPosition', () => (
    <Divider>
      <Box>
        <StyledSelect
          items={items}
          menuPosition="left"
        />
      </Box>
      <Box>
        <StyledSelect
          items={items}
          menuPosition="adjust"
        />
      </Box>
      <Box>
        <StyledSelect
          items={items}
          menuPosition="right"
        />
      </Box>
    </Divider>
  ));

// vim: set ts=2 sw=2 tw=80:
