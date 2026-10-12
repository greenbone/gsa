/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import _ from 'gmp/locale';
import DialogNotification from 'web/components/notification/DialogNotification';

export interface ErrorWithMessage {
  message: string;
}

interface DialogState {
  message?: string;
  title?: string;
}

/**
 * Provides actions for displaying message, success, and error dialogs.
 *
 * Render the returned `dialogNotification` element wherever the notification
 * dialog should appear. The dialog closes itself through its close controls.
 * Use `showMessage` to provide a message with an optional custom title,
 * `showSuccessMessage` for a success message, and `showErrorMessage` or
 * `showError` for error messages.
 *
 * @example
 *
 * const {dialogNotification, showError} = useDialogNotification();
 *
 * const handleError = (error: ErrorWithMessage) => {
 *   showError(error);
 * };
 *
 * return (
 *   <>
 *     <button onClick={() => handleError(new Error('Request failed'))}>
 *       Show error
 *     </button>
 *     {dialogNotification}
 *   </>
 * );
 *
 * @returns An object containing callbacks for showing messages and a
 * ready-to-render `dialogNotification` element.
 */
const useDialogNotification = () => {
  const [dialogState, setDialogState] = useState<DialogState>({});
  const showMessage = useCallback(
    (message: string, subject: string = _('Message')) => {
      setDialogState(() => ({
        message,
        title: subject,
      }));
    },
    [],
  );

  const showErrorMessage = useCallback(
    (message: string) => {
      showMessage(message, _('Error'));
    },
    [showMessage],
  );

  const showError = useCallback(
    (error: ErrorWithMessage) => {
      showErrorMessage(error.message);
    },
    [showErrorMessage],
  );

  const showSuccessMessage = useCallback(
    (message: string) => {
      showMessage(message, _('Success'));
    },
    [showMessage],
  );

  const handleDialogClose = useCallback(() => {
    setDialogState(prevState => ({...prevState, message: undefined}));
  }, []);

  const dialogNotification = (
    <DialogNotification {...dialogState} onCloseClick={handleDialogClose} />
  );
  return {
    showError,
    showErrorMessage,
    showMessage,
    showSuccessMessage,
    dialogNotification,
  };
};

export default useDialogNotification;
