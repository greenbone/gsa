/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import SnackbarCreator from '../snackbar';

describe('Snackbar tests', () => {
  test('should render', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toMatchSnapshot();
  });

  test('should not render if text is undefined', () => {
    const {queryByTestId} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    expect(queryByTestId('snackbar-container')).not.toBeInTheDocument();
  });

  test('should not render again if message stays the same', () => {
    const {element, queryByTestId, rerender} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );
    const message = {text: 'foo'};

    rerender(<SnackbarCreator message={message} />);

    expect(element).toHaveTextContent('foo');

    rerender(<SnackbarCreator message={message} />);

    setTimeout(
      () => expect(queryByTestId('snackbar-container')).not.toBeInTheDocument(),
      5000,
    );
  });

  test('should call handleClose', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');
    setTimeout(() => expect(element.handleClose()).toHaveBeenCalled(), 5000);
  });

  test('should close after 5 seconds', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');
    setTimeout(() => expect(element).not.toHaveTextContent('foo'), 5000);
  });

  test('should render multiple snackbars successively', () => {
    const {rerender, element} = render(
      <SnackbarCreator message={{text: undefined}} />,
    );

    rerender(<SnackbarCreator message={{text: 'foo'}} />);

    expect(element).toHaveTextContent('foo');

    rerender(<SnackbarCreator message={{text: 'bar'}} />);

    expect(element).toHaveTextContent('foo');
    expect(element).not.toHaveTextContent('bar');
    setTimeout(() => expect(element).not.toHaveTextContent('foo'), 5000);
    setTimeout(() => expect(element).toHaveTextContent('bar'), 5000);
  });
});
