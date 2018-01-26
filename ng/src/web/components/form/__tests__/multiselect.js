/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {Box, ArrowButton, Item} from '../selectelements.js';
import MultiSelect, {MultiSelectedValue} from '../multiselect.js';

describe('MultiSelect component tests', () => {

  test('should render without crashing', () => {
    mount(<MultiSelect/>);
  });

  test('should render with options', () => {
    const wrapper = mount(
      <MultiSelect>
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      </MultiSelect>
    );
    wrapper.find(ArrowButton).simulate('click');

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
      <MultiSelect items={items}/>
    );
    wrapper.find(ArrowButton).simulate('click');

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
      <MultiSelect
        items={items}
        onChange={onChange}
      />
    );

    wrapper.find(ArrowButton).simulate('click');
    wrapper.find(Item).at(1).simulate('click');

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(['foo'], undefined);
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
      <MultiSelect
        name="abc"
        items={items}
        onChange={onChange}
      />
    );

    wrapper.find(ArrowButton).simulate('click');
    wrapper.find(Item).at(0).simulate('click');

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(['bar'], 'abc');
  });

  test('should change displayed values', () => {
    const items = [{
      value: 'bar',
      label: 'Bar',
    }, {
      value: 'foo',
      label: 'Foo',
    }];

    const wrapper = mount(
      <MultiSelect
        items={items}
        value={['bar']}
      />
    );

    expect(wrapper.find(MultiSelectedValue).find('span').text()).toEqual('Bar');

    wrapper.setProps({value: ['foo']});
    expect(wrapper.find(MultiSelectedValue).find('span').text()).toEqual('Foo');

    wrapper.setProps({value: ['bar', 'foo']});
    expect(wrapper.find(MultiSelectedValue).find('span').length).toBe(2);
  });
});

// vim: set ts=2 sw=2 tw=80:
