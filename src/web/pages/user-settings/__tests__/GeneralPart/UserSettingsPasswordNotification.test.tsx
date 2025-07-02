/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import UserSettingsPasswordNotification from 'web/pages/user-settings/GeneralPart/UserSettingsPasswordNotification';
import Theme from 'web/utils/Theme';

describe('UserSettingsPasswordNotification', () => {
  test('should render nothing when all passwords are empty', () => {
    render(
      <UserSettingsPasswordNotification
        confPassword=""
        newPassword=""
        oldPassword=""
      />,
    );

    const notificationDiv = screen.queryByText(/password/i);
    expect(notificationDiv).not.toBeInTheDocument();
  });

  test('should show warning when old password is set but new password is empty', () => {
    render(
      <UserSettingsPasswordNotification
        confPassword=""
        newPassword=""
        oldPassword="oldpass123"
      />,
    );

    const notification = screen.getByText('Please enter a new password!');
    expect(notification).toBeVisible();
    expect(notification).toHaveStyle(`color: ${Theme.warningRed}`);
  });

  test.each([
    {
      confPassword: '',
      newPassword: 'newpass123',
      description: 'new password set',
    },
    {
      confPassword: 'confpass123',
      newPassword: '',
      description: 'conf password set',
    },
    {
      confPassword: 'confpass123',
      newPassword: 'newpass123',
      description: 'both new and conf passwords set',
    },
  ])(
    'should show warning when old password is empty but $description',
    ({confPassword, newPassword}) => {
      render(
        <UserSettingsPasswordNotification
          confPassword={confPassword}
          newPassword={newPassword}
          oldPassword=""
        />,
      );

      const notification = screen.getByText('Please enter your old password!');
      expect(notification).toBeVisible();
      expect(notification).toHaveStyle(`color: ${Theme.warningRed}`);
    },
  );

  test.each([
    {
      confPassword: 'differentpass',
      newPassword: 'newpass123',
      oldPassword: 'oldpass123',
      expectedText: 'Confirmation does not match new password!',
      color: Theme.warningRed,
      description: 'passwords do not match',
    },
    {
      confPassword: 'newpass123',
      newPassword: 'newpass123',
      oldPassword: 'oldpass123',
      expectedText: 'Confirmation matches new password!',
      color: Theme.darkGreen,
      description: 'passwords match',
    },
  ])(
    'should show appropriate message when $description',
    ({confPassword, newPassword, oldPassword, expectedText, color}) => {
      render(
        <UserSettingsPasswordNotification
          confPassword={confPassword}
          newPassword={newPassword}
          oldPassword={oldPassword}
        />,
      );

      const notification = screen.getByText(expectedText);
      expect(notification).toBeVisible();
      expect(notification).toHaveStyle(`color: ${color}`);
    },
  );
});
