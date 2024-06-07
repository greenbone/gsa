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

import {render, fireEvent, screen} from 'web/utils/testing';

import NumberField from '../numberfield';

describe('NumberField tests', () => {
  test('should render', () => {
    render(<NumberField data-testid="input" value={1} />);

    const element = screen.getByTestId('input');

    expect(element).toHaveAttribute('value', '1');
  });

  test('should call change handler', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should call change handler for characters with empty string', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'ABC'}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
  });

  test('should allow to clear input', () => {
    const onChange = testing.fn();
    render(<NumberField data-testid="input" value={1} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('', undefined);
    expect(element).toHaveAttribute('value', '');
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();
    render(
      <NumberField
        data-testid="input"
        name="foo"
        value={1}
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, 'foo');
    expect(element).toHaveAttribute('value', '2');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();
    render(
      <NumberField
        data-testid="input"
        disabled={true}
        value={1}
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should update value', () => {
    const onChange = testing.fn();
    const {rerender} = render(
      <NumberField data-testid="input" value={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '2'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField data-testid="input" value={2} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '2');

    rerender(<NumberField data-testid="input" value={3} onChange={onChange} />);

    expect(element).toHaveAttribute('value', '3');
  });

  test('should use max if value > max', () => {
    const onChange = testing.fn();
    render(
      <NumberField data-testid="input" value={1} max={2} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '3'}});

    expect(onChange).toHaveBeenCalledWith(2, undefined);
    expect(element).toHaveAttribute('value', '2');
  });

  test('should use min if value < min', () => {
    const onChange = testing.fn();
    render(
      <NumberField data-testid="input" value={2} min={1} onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: '0'}});

    expect(onChange).toHaveBeenCalledWith(1, undefined);
    expect(element).toHaveAttribute('value', '1');
  });
});
