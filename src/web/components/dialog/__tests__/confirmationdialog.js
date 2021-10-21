/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {render, fireEvent} from 'web/utils/testing';

import ConfirmationDialog from '../confirmationdialog';
import {KeyCode} from 'gmp/utils/event';

describe('ConfirmationDialog component tests', () => {
  test('should render ConfirmationDialog with text and title', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {baseElement, getByTestId} = render(
      <ConfirmationDialog
        content="foo"
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const contentElement = getByTestId('confirmationdialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should render ConfirmationDialog with element content and title', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {getByTestId} = render(
      <ConfirmationDialog
        content={<div>foo</div>}
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const contentElement = getByTestId('confirmationdialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should close ConfirmationDialog with close button', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {getByTestId} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog with cancel button', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {baseElement} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should resume ConfirmationDialog with resume button', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {baseElement} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    expect(handleResumeClick).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog on escape key', () => {
    const handleClose = jest.fn();
    const handleResumeClick = jest.fn();

    const {getByRole} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.keyDown(getByRole('dialog'), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
