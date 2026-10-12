/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useDialogNotification, {
  type ErrorWithMessage,
} from 'web/components/notification/useDialogNotification';
import {updateDisplayName} from 'web/utils/display-name';

export interface DialogNotificationProps {
  showError: (error: ErrorWithMessage) => void;
  showErrorMessage: (message: string) => void;
  showMessage: (message: string, subject?: string) => void;
  showSuccessMessage: (message: string) => void;
}

const withDialogNotification = <TProps extends {} = {}>(
  Component: React.ComponentType<TProps & DialogNotificationProps>,
) => {
  const WithDialogNotification = (props: TProps) => {
    const {dialogNotification, ...notificationProps} = useDialogNotification();
    return (
      <>
        <Component {...props} {...notificationProps} />
        {dialogNotification}
      </>
    );
  };

  return updateDisplayName(
    WithDialogNotification,
    Component,
    'withDialogNotification',
  );
};

export default withDialogNotification;
