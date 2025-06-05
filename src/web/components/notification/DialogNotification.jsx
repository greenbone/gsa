/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {hasValue} from 'gmp/utils/identity';
import Dialog from 'web/components/dialog/Dialog';
import DialogFooter from 'web/components/dialog/DialogFooter';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const DialogNotification = ({
  title,
  message,
  onCloseClick,
  onClose = onCloseClick,
}) => {
  const [_] = useTranslation();

  if (!hasValue(message)) {
    return null;
  }
  return (
    <Dialog opened={true} size="400px" title={title} onClose={onClose}>
      {message}
      <DialogFooter
        data-testid="dialog-notification-footer"
        title={_('Close')}
        onClick={onCloseClick}
      />
    </Dialog>
  );
};

DialogNotification.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func,
};

export default DialogNotification;
