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

import {mount} from 'enzyme';
import Select from '../select.js';
import {Box, SelectedValue, Item} from '../selectelements.js';

describe('Select component tests', () => {

  test('should render without crashing', () => {
    mount(<Select/>);
  });

  test('should render with options', () => {
    const wrapper = mount(
      <Select>
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      </Select>
    );

    wrapper.find(Box).simulate('click');

    const elements = wrapper.find(Item);

    expect(elements.length).toBe(2);
  });

  test('should render with items', () => {
    const items = [{
      value: 'bar',
      label: 'Bar',
    }, {
      value: 'foo',
      label: 'Foo',
    }];
    const wrapper = mount(
      <Select
        items={items}
      />
    );
    wrapper.find(Box).simulate('click');

    const elements = wrapper.find(Item);

    expect(elements.length).toBe(2);
  });

  test('should call onChange handler', () => {
    const items = [{
      value: 'bar',
      label: 'Bar',
    }, {
      value: 'foo',
      label: 'Foo',
    }];

    const onChange = jest.fn();

    const wrapper = mount(
      <Select
        items={items}
        onChange={onChange}
      />
    );

    wrapper.find(Box).simulate('click');
    wrapper.find(Item).at(1).simulate('click');

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('foo', undefined);
  });

  test('should call onChange handler with name', () => {
    const items = [{
      value: 'bar',
      label: 'Bar',
    }, {
      value: 'foo',
      label: 'Foo',
    }];

    const onChange = jest.fn();

    const wrapper = mount(
      <Select
        name="abc"
        items={items}
        onChange={onChange}
      />
    );

    wrapper.find(Box).simulate('click');
    wrapper.find(Item).at(0).simulate('click');

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('bar', 'abc');
  });

  test('should change displayed value', () => {
    const items = [{
      value: 'bar',
      label: 'Bar',
    }, {
      value: 'foo',
      label: 'Foo',
    }];

    const wrapper = mount(
      <Select
        items={items}
        value="bar"
      />
    );

    expect(wrapper.find(SelectedValue).text()).toEqual('Bar');

    wrapper.setProps({value: 'foo'});
    expect(wrapper.find(SelectedValue).text()).toEqual('Foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
