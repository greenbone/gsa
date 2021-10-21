/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {render, fireEvent} from 'web/utils/testing';

import YesNoRadio from '../yesnoradio';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

setLocale('en');

describe('YesNoRadio tests', () => {
  test('should render', () => {
    const {element, getAllByTestId} = render(<YesNoRadio />);

    expect(element).toMatchSnapshot();

    const titleElements = getAllByTestId('radio-title');
    expect(titleElements.length).toEqual(2);
    expect(titleElements[0]).toHaveTextContent('Yes');
    expect(titleElements[1]).toHaveTextContent('No');
  });

  test('should call change handler', () => {
    const onChange = jest.fn();
    const {getAllByTestId} = render(<YesNoRadio onChange={onChange} />);

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, undefined);

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should call change handler with name', () => {
    const onChange = jest.fn();
    const {getAllByTestId} = render(
      <YesNoRadio name="foo" onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'foo');
  });

  test('should allow to set values for yes and no state', () => {
    const onChange = jest.fn();
    const {getAllByTestId} = render(
      <YesNoRadio
        convert={v => v}
        name="ipsum"
        yesValue="foo"
        noValue="bar"
        onChange={onChange}
      />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith('foo', 'ipsum');

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith('bar', 'ipsum');
  });

  test('should call change handler only if checked state changes', () => {
    const onChange = jest.fn();
    const {getAllByTestId} = render(
      <YesNoRadio value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = jest.fn();
    const {getAllByTestId} = render(
      <YesNoRadio disabled={true} value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getAllByTestId('radio-input');
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
