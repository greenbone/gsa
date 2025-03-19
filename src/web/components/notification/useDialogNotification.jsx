/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {useCallback, useState} from 'react';

/**
 * Hook to handle the state for showing different types of messages in a dialog
 *
 * Should be used in conjunction with a DialogNotification component
 *
 * @example
 *
 * const {
 *   dialogState,
 *   closeDialog,
 *   showError,
 *   showMessage,
 * } = useDialogNotification();
 *
 * return (
 *   <DialogNotification
 *      {...dialogState}
 *      onCloseClick={closeDialog}
 *   />
 * );
 * @returns {Object} Object containing the dialog state and functions to show different types of messages
 */
const useDialogNotification = () => {
  const [dialogState, setDialogState] = useState({});
  const showMessage = useCallback((message, subject = _('Message')) => {
    setDialogState(() => ({
      message,
      title: subject,
    }));
  }, []);

  const showErrorMessage = useCallback(
    message => {
      showMessage(message, _('Error'));
    },
    [showMessage],
  );

  const showError = useCallback(
    error => {
      showErrorMessage(error.message);
    },
    [showErrorMessage],
  );

  const showSuccessMessage = useCallback(
    message => {
      showMessage(message, _('Success'));
    },
    [showMessage],
  );

  const handleDialogClose = useCallback(() => {
    setDialogState(prevState => ({...prevState, message: undefined}));
  }, []);
  return {
    closeDialog: handleDialogClose,
    showError,
    showErrorMessage,
    showMessage,
    showSuccessMessage,
    dialogState,
  };
};

export default useDialogNotification;
