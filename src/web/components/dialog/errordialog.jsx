/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import ScrollableContent from 'web/components/dialog/scrollablecontent';
import DialogTitle from 'web/components/dialog/title';
import DialogFooter from 'web/components/dialog/footer';

const DEFAULT_DIALOG_WIDTH = '400px';

const ErrorDialogContent = ({moveprops, text, title, buttonTitle, close}) => {
  return (
    <DialogContent>
      <DialogTitle title={title} onCloseClick={close} {...moveprops} data-testid="errordialog_title"/>
      <ScrollableContent data-testid="errordialog-content_scrollable">
        {text}
      </ScrollableContent>
      <DialogFooter title={buttonTitle} onClick={close} />
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
  buttonTitle = _('OK'),
  onClose,
}) => {
  return (
    <Dialog width={width} onClose={onClose} resizable={false}>
      {({close, moveProps}) => (
        <ErrorDialogContent
          data-testid="errordialog-content"
          close={close}
          moveprops={moveProps}
          text={text}
          title={title}
          buttonTitle={buttonTitle}
        />
      )}
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
