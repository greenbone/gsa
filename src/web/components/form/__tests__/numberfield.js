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

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent} from 'web/utils/testing';

import NumberField from '../numberfield';

describe('NumberField tests', () => {
  test('should render', () => {
    const {element} = render(<NumberField value={1} />);

    expect(element).toHaveAttribute('value', '1');
    expect(element).toMatchSnapshot();
  });

  test('should call change handler', () => {
    const onChange = jest.fn();
    const {element} = render(<NumberField value={1} onChange={onChange} />);

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should call change handler with value and name', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField name="foo" value={1} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, 'foo');
    expect(element).toHaveAttribute('value', '2');
  });

  test('should not call change handler if disabled', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField disabled={true} value={1} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('value', '1');
  });

  test('should update value', () => {
    const onChange = jest.fn();
    const {element, rerender} = render(
      <NumberField value={1} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField value={2} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField value={3} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '3');
  });

  test('should not call change handler if value > max', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField value={1} max={2} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '3'}});

    expect(onChange).not.toHaveBeenCalled();
    // value will be shown but reset on blur
    expect(element).toHaveAttribute('value', '3');
  });

  test('should reset to max', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField value={1} max={2} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '3'}});

    expect(onChange).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('value', '3');

    fireEvent.keyDown(element, {key: 'Enter', keyCode: KeyCode.ENTER});

    expect(element).toHaveAttribute('value', '2');
  });

  test('should not call change handler if value < min', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField value={1} min={1} onChange={onChange} />,
    );

    fireEvent.change(element, {target: {value: '0'}});

    expect(onChange).not.toHaveBeenCalled();
    // will be set to min after blur only
    expect(element).toHaveAttribute('value', '0');
  });

  test('should reset to min', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField value={2} min={1} onChange={onChange} />,
    );

    expect(element).toHaveAttribute('value', '2');

    fireEvent.change(element, {target: {value: '0'}});

    expect(onChange).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('value', '0');

    fireEvent.keyDown(element, {key: 'Enter', keyCode: KeyCode.ENTER});

    expect(element).toHaveAttribute('value', '1');
  });

  test('should reset to last valid value', () => {
    const onChange = jest.fn();
    const {element} = render(
      <NumberField value={2} min={1} onChange={onChange} />,
    );

    expect(element).toHaveAttribute('value', '2');

    fireEvent.change(element, {target: {value: 'a'}});

    expect(onChange).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('value', 'a');

    fireEvent.keyDown(element, {key: 'Enter', keyCode: KeyCode.ENTER});

    expect(element).toHaveAttribute('value', '2');
  });

  test('should not allow to add letters', () => {
    const handler = jest.fn();
    const {element} = render(<NumberField value={1} onKeyDown={handler} />);

    fireEvent.keyDown(element, {key: 'a', keyCode: 65});

    expect(handler).not.toHaveBeenCalled();
  });

  test('should allow to add numbers', () => {
    const handler = jest.fn();
    const {element} = render(<NumberField value={1} onKeyDown={handler} />);

    fireEvent.keyDown(element, {key: '1', keyCode: 49});
    fireEvent.keyDown(element, {key: '2', keyCode: 50});

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('should allow point key for float numbers', () => {
    const handler = jest.fn();
    const {element} = render(
      <NumberField value={1} type="float" onKeyDown={handler} />,
    );

    fireEvent.keyDown(element, {key: '.', keyCode: KeyCode.PERIOD});
    fireEvent.keyDown(element, {key: '2', keyCode: 50});

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('should not allow point key for int numbers', () => {
    const handler = jest.fn();
    const {element} = render(
      <NumberField value={1} type="int" onKeyDown={handler} />,
    );

    fireEvent.keyDown(element, {key: '.', keyCode: KeyCode.PERIOD});
    fireEvent.keyDown(element, {key: '2', keyCode: 50});

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should call onDownKeyPressed handler', () => {
    const handler = jest.fn();
    const {element} = render(
      <NumberField value={1} onDownKeyPressed={handler} />,
    );

    fireEvent.keyDown(element, {key: '1', keyCode: 49});
    expect(handler).not.toHaveBeenCalled();

    fireEvent.keyDown(element, {key: 'PageDown', keyCode: KeyCode.PAGE_DOWN});
    fireEvent.keyDown(element, {key: 'ArrowDown', keyCode: KeyCode.DOWN});

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('should call onUpKeyPressed handler', () => {
    const handler = jest.fn();
    const {element} = render(
      <NumberField value={1} onUpKeyPressed={handler} />,
    );

    fireEvent.keyDown(element, {key: '1', keyCode: 49});
    expect(handler).not.toHaveBeenCalled();

    fireEvent.keyDown(element, {key: 'PageUp', keyCode: KeyCode.PAGE_UP});
    fireEvent.keyDown(element, {key: 'ArrowUp', keyCode: KeyCode.UP});

    expect(handler).toHaveBeenCalledTimes(2);
  });
});

// vim: set ts=2 sw=2 tw=80:
