/* Copyright (C) 2019-2022 Greenbone AG
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

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent, screen} from 'web/utils/testing';

import {
  closeDialog,
  getDialogContent,
  getDialogTitle,
  queryDialog,
} from 'web/components/testing';

import ConfirmationDialog from '../confirmationdialog';

describe('ConfirmationDialog component tests', () => {
  test('should render ConfirmationDialog with text and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        content="foo"
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(queryDialog()).toBeInTheDocument();

    expect(getDialogContent()).toHaveTextContent('foo');
    expect(getDialogTitle()).toHaveTextContent('bar');
  });

  test('should render ConfirmationDialog with element content and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        content={<div>foo</div>}
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(queryDialog()).toBeInTheDocument();

    expect(getDialogContent()).toHaveTextContent('foo');
    expect(getDialogTitle()).toHaveTextContent('bar');
  });

  test('should close ConfirmationDialog with close button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    closeDialog();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog with cancel button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-close-button'));
    expect(handleClose).toHaveBeenCalled();
  });

  test('should resume ConfirmationDialog with resume button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-save-button'));
    expect(handleResumeClick).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog on escape key', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

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
