/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue} from 'gmp/utils/identity';
import Dialog from 'web/components/dialog/Dialog';
import DialogFooter from 'web/components/dialog/DialogFooter';
import useTranslation from 'web/hooks/useTranslation';

interface DialogNotificationProps {
  title?: string;
  message?: string;
  onClose?: () => void;
  onCloseClick?: () => void;
}

const DialogNotification = ({
  title,
  message,
  onCloseClick,
  onClose = onCloseClick,
}: DialogNotificationProps) => {
  const [_] = useTranslation();

  if (!hasValue(message)) {
    return null;
  }
  return (
    <Dialog title={title} width="400px" onClose={onClose}>
      {message}
      <DialogFooter
        data-testid="dialog-notification-footer"
        title={_('Close')}
        onClick={onCloseClick}
      />
    </Dialog>
  );
};

export default DialogNotification;
