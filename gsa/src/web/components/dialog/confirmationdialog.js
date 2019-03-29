/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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

class ConfirmationDialogContent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleResume = this.handleResume.bind(this);
  }

  handleResume() {
    const {onResumeClick} = this.props;

    if (onResumeClick) {
      onResumeClick();
    }
    this.props.close();
  }

  render() {
    const {moveprops, text, title, rightButtonTitle} = this.props;

    return (
      <DialogContent>
        <DialogTitle
          title={title}
          onCloseClick={this.props.close}
          {...moveprops}
        />
        <ScrollableContent data-testid="confirmationdialog-content">
          {text}
        </ScrollableContent>
        <DialogTwoButtonFooter
          rightButtonTitle={rightButtonTitle}
          onLeftButtonClick={this.props.close}
          onRightButtonClick={this.handleResume}
        />
      </DialogContent>
    );
  }
}

ConfirmationDialogContent.propTypes = {
  close: PropTypes.func.isRequired,
  moveprops: PropTypes.object,
  rightButtonTitle: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

const ConfirmationDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  text,
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
          text={text}
          title={title}
          rightButtonTitle={rightButtonTitle}
          onResumeClick={onResumeClick}
        />
      )}
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  rightButtonTitle: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

export default ConfirmationDialog;

// vim: set ts=2 sw=2 tw=80:
