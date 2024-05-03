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

import {render, fireEvent} from 'web/utils/testing';

import {
  changeInputValue,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';

import Dialog from '../dialog';

describe('RADIUS dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(getDialog()).toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      enable: true,
      radiushost: 'foo',
      radiuskey: '',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByTestId} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const radiusHostTextField = getByTestId('radiushost-textfield');
    changeInputValue(radiusHostTextField, 'lorem');

    const radiusKeyTextField = getByTestId('radiuskey-textfield');
    changeInputValue(radiusKeyTextField, 'bar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      radiushost: 'lorem',
      enable: false,
      radiuskey: 'bar',
    });
  });
});
