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

import Radio from '../radio';

describe('Radio tests', () => {
  test('should render radio', () => {
    const {element} = render(<Radio />);

    expect(element).toBeInTheDocument();
  });

  test('should call change handler', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalled();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" value="foo" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(
      <Radio data-testid="input" name="bar" value="foo" onChange={onChange} />,
    );

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).toHaveBeenCalledWith('foo', 'bar');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(<Radio data-testid="input" disabled={true} onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('should render title', () => {
    const {element} = render(<Radio data-testid="input" title="foo" />);

    const titleElement = element.querySelector('label');
    expect(titleElement).toHaveTextContent('foo');
  });

  test('should not call change handler if already checked', () => {
    const onChange = testing.fn();

    render(
      <Radio
        data-testid="input"
        checked={true}
        value="foo"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.click(element);

    expect(onChange).not.toHaveBeenCalled();
  });
});
