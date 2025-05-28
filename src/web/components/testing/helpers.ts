/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, Mock} from 'vitest';
import {screen} from 'web/components/testing/screen';
import {fireEvent} from 'web/utils/Testing';

export const testBulkTrashcanDialog = (
  _screen: unknown,
  dialogAction: Mock,
) => {
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeVisible();

  const moveToTrashcanButton = screen.getByText('Move to Trashcan');
  fireEvent.click(moveToTrashcanButton);

  expect(dialogAction).toHaveBeenCalled();
};

export const testBulkDeleteDialog = (_screen: unknown, dialogAction: Mock) => {
  const dialog = screen.getByTestId('confirmation-dialog');
  expect(dialog).toBeVisible();

  const title = screen.getByText('Confirm Deletion');

  expect(title).toBeVisible();

  const deleteButton = screen.getByText('Delete');
  fireEvent.click(deleteButton);

  expect(dialogAction).toHaveBeenCalled();
};
