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

import {render} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import {Box, Item, Input, ItemContainer, SelectContainer, SelectedValue} from '../selectelements';

describe('Box tests', () => {

  test('should render', () => {
    const {element} = render(
      <Box/>
    );

    expect(element).toHaveStyleRule('background-color', Theme.white);
    expect(element).toHaveStyleRule('border-radius', '2px');
    expect(element).toMatchSnapshot();
  });

  test('should render opened', () => {
    const {element} = render(
      <Box
        isOpen={true}
      />
    );

    expect(element).toHaveStyleRule('border-radius', '2px 2px 0 0');
    expect(element).toMatchSnapshot();
  });

  test('should render disabled', () => {
    const {element} = render(
      <Box
        disabled={true}
      />
    );

    expect(element).toHaveStyleRule('background-color', Theme.dialogGray);
    expect(element).toMatchSnapshot();
  });

});

describe('Input tests', () => {

  test('should render', () => {
    const {element} = render(
      <Input/>
    );
    expect(element).toMatchSnapshot();
  });

});

describe('Item tests', () => {

  test('should render', () => {
    const {element} = render(
      <Item/>
    );

    expect(element).not.toHaveStyleRule('background-color');
    expect(element).not.toHaveStyleRule('color');
    expect(element).toMatchSnapshot();
  });

  test('should render active', () => {
    const {element} = render(
      <Item
        isActive={true}
      />
    );

    expect(element).toHaveStyleRule('background-color', Theme.mediumBlue);
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toMatchSnapshot();
  });

  test('should render selected', () => {
    const {element} = render(
      <Item
        isSelected={true}
      />
    );

    expect(element).toHaveStyleRule('background-color', Theme.lightGray);
    expect(element).not.toHaveStyleRule('color');
    expect(element).toMatchSnapshot();
  });

});

describe('ItemContainer tests', () => {

  test('should render', () => {
    const {element} = render(
      <ItemContainer/>
    );
    expect(element).toMatchSnapshot();
  });

});

describe('SelectContainer tests', () => {

  test('should render', () => {
    const {element} = render(
      <SelectContainer
        width="100px"
      />
    );

    expect(element).toHaveStyleRule('width', '100px');
    expect(element).toMatchSnapshot();
  });

});

describe('SelectValue tests', () => {

  test('should render', () => {
    const {element} = render(
      <SelectedValue/>
    );

    expect(element).toHaveStyleRule('cursor', 'pointer');
    expect(element).toMatchSnapshot();
  });

  test('should render disabled', () => {
    const {element} = render(
      <SelectedValue
        disabled={true}
      />
    );

    expect(element).toHaveStyleRule('cursor', 'default');
    expect(element).toMatchSnapshot();
  });

});

// vim: set ts=2 sw=2 tw=80:
