/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogTitle from 'web/components/dialog/title';
import ScrollableContent from 'web/components/dialog/scrollablecontent';

import Button from 'web/components/dialog/button';

import Layout from 'web/components/layout/layout';

const DEFAULT_DIALOG_WIDTH = '400px';

const StyledLayout = styled(Layout)`
  justify-content: space-between;
  border-width: 1px 0 0 0;
  border-style: solid;
  border-color: ${Theme.lightGray};
  margin-top: 15px;
  padding: 10px 15px 10px 15px;
`;

class ConfirmationDialogContent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleResume = this.handleResume.bind(this);
  }

  handleResume() {
    const {
      onResumeClick,
    } = this.props;

    if (onResumeClick) {
      onResumeClick();
    }
    this.props.close();
  }

  render() {
    const {
      moveprops,
      text,
      title,
    } = this.props;

    return (
      <DialogContent>
        <DialogTitle
          title={title}
          onCloseClick={this.props.close}
          {...moveprops}
        />
        <ScrollableContent>
          {text}
        </ScrollableContent>
        <StyledLayout >
          <Button
            onClick={this.props.close}
            title={_('Cancel')}
          >
            {_('Cancel')}
          </Button>
          <Button
            onClick={this.handleResume}
            title={_('Follow Link')}
          >
            {_('Follow Link')}
          </Button>
        </StyledLayout>
      </DialogContent>
    );
  }
}

ConfirmationDialogContent.propTypes = {
  close: PropTypes.func.isRequired,
  moveprops: PropTypes.object,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

const LinkConfirmationDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  text,
  title,
  onClose,
  onResumeClick,
}) => {
  return (
    <Dialog
      width={width}
      onClose={onClose}
      resizable={false}
    >
      {({
        close,
        moveProps,
      }) => (
        <ConfirmationDialogContent
          close={close}
          moveprops={moveProps}
          text={text}
          title={title}
          onResumeClick={onResumeClick}
        />
      )}
    </Dialog>
  );
};

LinkConfirmationDialog.propTypes = {
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

export default LinkConfirmationDialog;

// vim: set ts=2 sw=2 tw=80:
