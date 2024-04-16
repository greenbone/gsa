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

import TextArea from '../textarea';

describe('TextArea tests', () => {
  test('should render', () => {
    const {element} = render(<TextArea />);

    expect(element).toBeInTheDocument();
  });

  test('should render error', () => {
    render(<TextArea errorContent="Some Error" />);

    expect(screen.getByText('Some Error')).toBeVisible();
  });

  test('should call change handler with value', () => {
    const onChange = testing.fn();

    render(<TextArea data-testid="input" value="foo" onChange={onChange} />);

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call change handler with value and name', () => {
    const onChange = testing.fn();

    render(
      <TextArea
        data-testid="input"
        name="foo"
        value="ipsum"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should not call change handler if disabled', () => {
    const onChange = testing.fn();

    render(
      <TextArea
        data-testid="input"
        disabled={true}
        value="foo"
        onChange={onChange}
      />,
    );

    const element = screen.getByTestId('input');

    fireEvent.change(element, {target: {value: 'bar'}});

    expect(onChange).not.toHaveBeenCalled();
  });
});
