/* Copyright (C) 2022 Greenbone AG
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
import userEvent from '@testing-library/user-event';

import {setLocale} from 'gmp/models/date';

import {render} from 'web/utils/testing';

import Dialog from '../dialog';

setLocale('en');

describe('LicenseDialog component tests', () => {
  test('should render dialog with file selection', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {baseElement, getByName} = render(
      <Dialog
        onClose={handleClose}
        onErrorClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('New License');
    expect(baseElement).toHaveTextContent('License File');

    const button = getByName('file');
    expect(button).toBeDefined();
  });

  test('should close Dialog with close button', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        onClose={handleClose}
        onErrorClose={handleClose}
        onSave={handleSave}
      />,
    );
    const closeButton = getByTestId('dialog-title-close-button');

    expect(closeButton).toBeInTheDocument();

    userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close Dialog with cancel button', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        onClose={handleClose}
        onErrorClose={handleClose}
        onSave={handleSave}
      />,
    );
    const cancelButton = getByTestId('dialog-close-button');

    expect(cancelButton).toBeInTheDocument();

    userEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should call clickhandler for save button if license not active', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        status="corrupt"
        onClose={handleClose}
        onErrorClose={handleClose}
        onSave={handleSave}
      />,
    );
    const saveButton = getByTestId('dialog-save-button');

    expect(saveButton).toBeInTheDocument();

    userEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });

  test('should not call clickhandler for save button if license active', () => {
    // this indirectly figures out if the click handler was intercepted by the
    // ConfirmationDialog, which should pop up for valid/active licenses
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        status="active"
        onClose={handleClose}
        onErrorClose={handleClose}
        onSave={handleSave}
      />,
    );
    const saveButton = getByTestId('dialog-save-button');

    expect(saveButton).toBeInTheDocument();

    userEvent.click(saveButton);

    expect(handleSave).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
