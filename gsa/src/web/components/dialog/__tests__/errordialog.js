/* Copyright (C) 2019 Greenbone Networks GmbH
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

import {render, fireEvent} from 'web/utils/testing';

import ErrorDialog from '../errordialog';
import {KeyCode} from 'gmp/utils/event';

describe('ErrorDialog component tests', () => {
  test('should render ErrorDialog with text and title', () => {
    const handleClose = jest.fn();

    const {baseElement, getByTestId} = render(
      <ErrorDialog text="foo" title="bar" onClose={handleClose} />,
    );

    expect(baseElement).toMatchSnapshot();
    const contentElement = getByTestId('errordialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should close ErrorDialog with close button', () => {
    const handleClose = jest.fn();

    const {getByTestId} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    const closeButton = getByTestId('dialog-title-close-button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ErrorDialog with resume button', () => {
    const handleClose = jest.fn();

    const {baseElement} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ErrorDialog on escape key', () => {
    const handleClose = jest.fn();

    const {getByRole} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    fireEvent.keyDown(getByRole('dialog'), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
