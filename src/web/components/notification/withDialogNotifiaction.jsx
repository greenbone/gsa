/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import DialogNotification from './dialognotification';
import useDialogNotification from './useDialogNotification';

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

// vim: set ts=2 sw=2 tw=80:
