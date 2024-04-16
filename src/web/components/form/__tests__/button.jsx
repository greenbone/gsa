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

import Button from '../button';

describe('Button tests', () => {
  test('should call click handler', () => {
    const handler = testing.fn();

    render(<Button onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = testing.fn();

    render(<Button onClick={handler} value="bar" />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = testing.fn();

    render(<Button name="foo" value="bar" onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toBeInTheDocument();
  });

  test('should render title', () => {
    const {element} = render(<Button title="foo" />);

    expect(element).toHaveTextContent('foo');
  });

  test('should prefer children over title', () => {
    const {element} = render(<Button title="foo">bar</Button>);

    expect(element).toHaveTextContent('bar');
  });

  test('should render disabled', () => {
    const {element} = render(<Button disabled={true} />);

    expect(element).toBeDisabled();
  });

  test('should not call click handler when disabled', () => {
    const handler = testing.fn();

    render(<Button name="foo" value="bar" disabled={true} onClick={handler} />);

    const element = screen.getByRole('button');

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should render loading', () => {
    render(<Button isLoading={true} />);

    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('data-loading', 'true');
  });
});

// vim: set ts=2 sw=2 tw=80:
