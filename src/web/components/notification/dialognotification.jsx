/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogFooter from 'web/components/dialog/footer';
import DialogTitle from 'web/components/dialog/title';
import ScrollableContent from 'web/components/dialog/scrollablecontent';

const DialogNotification = ({title, message, onCloseClick}) => {
  const [_] = useTranslation();

  if (!hasValue(message)) {
    return null;
  }
  return (
    <Dialog width="400px" onClose={onCloseClick}>
      {({close, moveProps, heightProps}) => (
        <DialogContent>
          <DialogTitle title={title} onCloseClick={close} {...moveProps} />
          <ScrollableContent
            {...heightProps}
            data-testid="dialog-notification-message"
          >
            {message}
          </ScrollableContent>
          <DialogFooter
            title={_('Close')}
            onClick={close}
            data-testid="dialog-notification-footer"
          />
        </DialogContent>
      )}
    </Dialog>
  );
};

DialogNotification.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogNotification;
