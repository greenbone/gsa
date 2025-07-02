/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface UserSettingsPasswordNotificationDivProps {
  color?: string;
}

interface UserSettingsPasswordNotificationProps {
  newPassword: string;
  oldPassword: string;
  confPassword: string;
}

const UserSettingsPasswordNotificationDiv = styled.div<UserSettingsPasswordNotificationDivProps>`
  color: ${props => props.color};
`;

const UserSettingsPasswordNotification = ({
  newPassword,
  oldPassword,
  confPassword,
}: UserSettingsPasswordNotificationProps) => {
  const [_] = useTranslation();
  let color: string | undefined = undefined;
  let text: string | null = null;

  if (oldPassword !== '' && newPassword === '' && confPassword === '') {
    color = Theme.warningRed;
    text = _('Please enter a new password!');
  } else if (
    oldPassword === '' &&
    (newPassword !== '' || confPassword !== '')
  ) {
    color = Theme.warningRed;
    text = _('Please enter your old password!');
  } else if (oldPassword !== '' && newPassword !== confPassword) {
    color = Theme.warningRed;
    text = _('Confirmation does not match new password!');
  } else if (oldPassword !== '' && newPassword === confPassword) {
    color = Theme.darkGreen;
    text = _('Confirmation matches new password!');
  }

  return (
    <UserSettingsPasswordNotificationDiv color={color}>
      {text}
    </UserSettingsPasswordNotificationDiv>
  );
};

export default UserSettingsPasswordNotification;
