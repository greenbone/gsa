/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

const withDialogNotification = Component => {
  const DialogNotificationWrapper = props => {
    const {dialogState, closeDialog, ...notificationProps} =
      useDialogNotification();
    return (
      <React.Fragment>
        <Component {...props} {...notificationProps} />
        <DialogNotification {...dialogState} onCloseClick={closeDialog} />
      </React.Fragment>
    );
  };
  return DialogNotificationWrapper;
};

export default withDialogNotification;
