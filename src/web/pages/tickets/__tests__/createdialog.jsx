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

import User from 'gmp/models/user';

import {render, fireEvent} from 'web/utils/testing';

import {
  changeInputValue,
  clickElement,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
  getSelectElement,
  getSelectItemElementsForSelect,
} from 'web/components/testing';

import CreateTicketDialog from '../createdialog';

const u1 = User.fromElement({
  _id: 'u1',
  name: 'foo',
});
const u2 = User.fromElement({
  _id: 'u2',
  name: 'bar',
});

const users = [u1, u2];

describe('CreateTicketDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    expect(getDialog()).toBeInTheDocument();
  });

  test('should allow to select user', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const select = getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems.length).toEqual(2);
    await clickElement(selectItems[1]);
    expect(handleUserIdChange).toHaveBeenCalledWith('u2', 'userId');
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    const {baseElement} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const noteInput = baseElement.querySelector('textarea');
    changeInputValue(noteInput, 'foobar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      resultId: 'r1',
      userId: 'u1',
      note: 'foobar',
    });
  });

  test('should not save invalid form states', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleUserIdChange = testing.fn();

    const {baseElement} = render(
      <CreateTicketDialog
        resultId="r1"
        userId="u1"
        users={users}
        onClose={handleClose}
        onSave={handleSave}
        onUserIdChange={handleUserIdChange}
      />,
    );

    const saveButton = getDialogSaveButton();
    const noteInput = baseElement.querySelector('textarea');
    changeInputValue(noteInput, '');

    fireEvent.click(saveButton);
    expect(handleSave).not.toHaveBeenCalled();
  });
});
