/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogFooter from 'web/components/dialog/footer';

const DEFAULT_DIALOG_WIDTH = '400px';

const ErrorDialogContent = ({children, buttonTitle, onClose}) => {
  return (
    <DialogContent>
      {children}
      <DialogFooter title={buttonTitle} onClick={onClose} />
    </DialogContent>
  );
};

ErrorDialogContent.propTypes = {
  buttonTitle: PropTypes.string,
  close: PropTypes.func.isRequired,
  moveprops: PropTypes.object,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const ErrorDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  text,
  title,
  buttonTitle,
  onClose,
}) => {
  const [_] = useTranslation();
  buttonTitle = buttonTitle || _('OK');
  return (
    <Dialog width={width} title={title} onClose={onClose}>
      <ErrorDialogContent onClose={onClose} buttonTitle={buttonTitle}>
        {text}
      </ErrorDialogContent>
    </Dialog>
  );
};

ErrorDialog.propTypes = {
  buttonTitle: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ErrorDialog;
