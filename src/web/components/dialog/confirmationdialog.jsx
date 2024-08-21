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
import DialogTwoButtonFooter from 'web/components/dialog/twobuttonfooter';

const DEFAULT_DIALOG_WIDTH = '400px';

const ConfirmationDialogContent = props => {
  const handleResume = () => {
    const {onResumeClick} = props;

    if (onResumeClick) {
      onResumeClick();
    }
  };

  const {content, moveprops, title, rightButtonTitle} = props;

  return (
    <DialogContent>
      <DialogTitle title={title} onCloseClick={props.close} {...moveprops} />
      <ScrollableContent data-testid="confirmationdialog-content">
        {content}
      </ScrollableContent>
      <DialogTwoButtonFooter
        rightButtonTitle={rightButtonTitle}
        onLeftButtonClick={props.close}
        onRightButtonClick={handleResume}
      />
    </DialogContent>
  );
};

ConfirmationDialogContent.propTypes = {
  close: PropTypes.func.isRequired,
  content: PropTypes.elementOrString,
  moveprops: PropTypes.object,
  rightButtonTitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

const ConfirmationDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  content,
  title,
  rightButtonTitle = _('OK'),
  onClose,
  onResumeClick,
}) => {
  return (
    <Dialog width={width} onClose={onClose} resizable={false}>
      {({close, moveProps}) => (
        <ConfirmationDialogContent
          close={close}
          moveprops={moveProps}
          content={content}
          title={title}
          rightButtonTitle={rightButtonTitle}
          onResumeClick={onResumeClick}
        />
      )}
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  content: PropTypes.elementOrString,
  rightButtonTitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

export default ConfirmationDialog;

// vim: set ts=2 sw=2 tw=80:
