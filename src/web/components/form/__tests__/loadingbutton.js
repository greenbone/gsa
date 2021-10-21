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

import Theme from 'web/utils/theme';
import {render, fireEvent} from 'web/utils/testing';

import LoadingButton from '../loadingbutton';

describe('LoadingButton tests', () => {
  test('should render non loading', () => {
    const {element} = render(<LoadingButton />);

    expect(element).toMatchSnapshot();
  });

  test('should render loading', () => {
    const {element} = render(<LoadingButton isLoading={true} />);

    expect(element).toMatchSnapshot();
  });

  test('should call click handler', () => {
    const handler = jest.fn();

    const {element} = render(<LoadingButton onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = jest.fn();

    const {element} = render(<LoadingButton onClick={handler} value="bar" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = jest.fn();

    const {element} = render(
      <LoadingButton name="foo" value="bar" onClick={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render title', () => {
    const {element} = render(<LoadingButton title="foo" />);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('foo');
  });

  test('should render title and children', () => {
    const {element} = render(<LoadingButton title="foo">bar</LoadingButton>);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('bar');
  });

  test('should render non loading with title', () => {
    const {element} = render(<LoadingButton title="foo" />);

    expect(element).toHaveStyleRule('background', Theme.white);
  });

  test('should render loading with title', () => {
    const {element} = render(<LoadingButton title="foo" isLoading={true} />);

    expect(element).toHaveStyleRule(
      'background',
      `${Theme.lightGreen} url(/img/loading.gif) center center no-repeat`,
    );
  });
});

// vim: set ts=2 sw=2 tw=80:
