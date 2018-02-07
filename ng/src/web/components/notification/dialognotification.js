/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Dialog from '../dialog/dialog.js';
import DialogContent from '../dialog/content.js';
import DialogFooter from '../dialog/footer.js';
import DialogTitle from '../dialog/title.js';
import ScrollableContent from '../dialog/scrollablecontent.js';

import Wrapper from '../layout/wrapper.js';

class DialogNotification extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleShowError = this.handleShowError.bind(this);
    this.handleShowErrorMessage = this.handleShowErrorMessage.bind(this);
    this.handleShowMessage = this.handleShowMessage.bind(this);
    this.handleShowSuccessMessage = this.handleShowSuccessMessage.bind(this);

    this.state = {};
  }

  handleShowError(error) {
    this.handleShowErrorMessage(error.message);
  }

  handleShowErrorMessage(message) {
    this.handleShowMessage(message, _('Error'));
  }

  handleShowSuccessMessage(message) {
    this.handleShowMessage(message, _('Success'));
  }

  handleShowMessage(message, subject = _('Message')) {
    this.setState({
      message,
      title: subject,
    });
  }

  handleDialogClose() {
    this.setState({message: undefined});
  }

  isDialogOpen() {
    return is_defined(this.state.message);
  }

  render() {
    const {children} = this.props;

    if (!is_defined(children)) {
      return null;
    }

    const {title, message} = this.state;
    return (
      <Wrapper>
        {children({
          showError: this.handleShowError,
          showErrorMessage: this.handleShowErrorMessage,
          showMessage: this.handleShowMessage,
          showSuccessMessage: this.handleShowSuccessMessage,
        })}
        <Dialog
          width="400px"
          visible={this.isDialogOpen()}
          onClose={this.handleDialogClose}
        >
          {({
            close,
            moveProps,
            heightProps,
          }) => (
            <DialogContent>
              <DialogTitle
                title={title}
                onCloseClick={close}
                {...moveProps}
              />
              <ScrollableContent {...heightProps}>
                {message}
              </ScrollableContent>
              <DialogFooter
                title={_('Close')}
                onClick={close}
              />
            </DialogContent>
          )}
        </Dialog>
      </Wrapper>
    );
  }
}

DialogNotification.propTypes = {
  children: PropTypes.func,
};

export default DialogNotification;

// vim: set ts=2 sw=2 tw=80:
