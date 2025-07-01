/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface NotificationDivProps {
  color?: string;
}

interface NotificationProps {
  newPassword: string;
  oldPassword: string;
  confPassword: string;
}

const NotificationDiv = styled.div<NotificationDivProps>`
  color: ${props => props.color};
`;

const Notification = ({
  newPassword,
  oldPassword,
  confPassword,
}: NotificationProps) => {
  const [_] = useTranslation();
  let color;
  let text;

  if (oldPassword === '' && newPassword === '' && confPassword === '') {
    text = null;
  } else if (oldPassword !== '' && newPassword === '' && confPassword === '') {
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

  return <NotificationDiv color={color}>{text}</NotificationDiv>;
};

export default Notification;
