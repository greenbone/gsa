/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import ScrollableContent from 'web/components/dialog/scrollablecontent';
import DialogTitle from 'web/components/dialog/title';
import DialogTwoButtonFooter from 'web/components/dialog/twobuttonfooter';

import PropTypes from 'web/utils/proptypes';

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
