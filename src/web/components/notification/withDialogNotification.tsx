/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification, {
  ErrorWithMessage,
} from 'web/components/notification/useDialogNotification';
import {updateDisplayName} from 'web/utils/displayName';

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
    const {dialogState, closeDialog, ...notificationProps} =
      useDialogNotification();
    return (
      <>
        <Component {...props} {...notificationProps} />
        <DialogNotification {...dialogState} onCloseClick={closeDialog} />
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
