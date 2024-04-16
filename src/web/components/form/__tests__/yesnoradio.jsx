/* Copyright (C) 2018-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {render, fireEvent} from 'web/utils/testing';

import YesNoRadio from '../yesnoradio';

const getLabels = element => element.querySelectorAll('label');
const getRadioInputs = element =>
  element.querySelectorAll('.mantine-Radio-radio');

describe('YesNoRadio tests', () => {
  test('should render', () => {
    const {element} = render(<YesNoRadio />);

    const labels = getLabels(element);

    expect(labels[0]).toHaveTextContent('Yes');
    expect(labels[1]).toHaveTextContent('No');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    const {element} = render(<YesNoRadio onChange={onChange} />);

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, undefined);

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should call change handler with name', () => {
    const onChange = testing.fn();
    const {element} = render(<YesNoRadio name="foo" onChange={onChange} />);

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith(YES_VALUE, 'foo');
  });

  test('should allow to set values for yes and no state', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio
        convert={v => v}
        name="ipsum"
        yesValue="foo"
        noValue="bar"
        onChange={onChange}
      />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).toHaveBeenCalledWith('foo', 'ipsum');

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith('bar', 'ipsum');
  });

  test('should call change handler only if checked state changes', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).toHaveBeenCalledWith(NO_VALUE, undefined);
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    const {element} = render(
      <YesNoRadio disabled={true} value={YES_VALUE} onChange={onChange} />,
    );

    const inputs = getRadioInputs(element);
    expect(inputs.length).toEqual(2);

    fireEvent.click(inputs[0]);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(inputs[1]);

    expect(onChange).not.toHaveBeenCalled();
  });
});
