/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import User from 'gmp/models/user';
import ConfirmDeleteDialog from 'web/pages/users/ConfirmDeleteDialog';

const user = User.fromElement({
  _id: '1234',
  name: 'user 1',
});

const inheritor = User.fromElement({
  _id: '5678',
  name: 'user 2',
});

describe('ConfirmDeleteDialog', () => {
  test('should render single-user delete warning', () => {
    const {render} = rendererWith();
    render(
      <ConfirmDeleteDialog deleteUsers={[user]} inheritorUsers={[inheritor]} />,
    );

    screen.getByRole('heading', {name: 'User user 1 will be deleted.'});
    screen.getByText('Current User');
    screen.getByText('user 2');
  });

  test('should render multi-user delete warning', () => {
    const {render} = rendererWith();
    render(
      <ConfirmDeleteDialog
        deleteUsers={[user, inheritor]}
        inheritorUsers={[inheritor]}
      />,
    );

    screen.getByRole('heading', {name: '2 users will be deleted'});
  });

  test('should call onErrorClose when closing dialog error', () => {
    const onErrorClose = testing.fn();
    const {render} = rendererWith();
    render(
      <ConfirmDeleteDialog
        deleteUsers={[user]}
        error="Delete failed"
        inheritorUsers={[inheritor]}
        onErrorClose={onErrorClose}
      />,
    );

    const closeIcon = screen.getByTestId('close-button');
    closeIcon.click();
    expect(onErrorClose).toHaveBeenCalled();
  });
});
