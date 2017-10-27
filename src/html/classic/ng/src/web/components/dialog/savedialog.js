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

import {is_defined} from 'gmp/utils.js';

import State from '../../utils/state.js';
import PropTypes from '../../utils/proptypes.js';

import Dialog from '../dialog/dialog.js';
import DialogContent from '../dialog/content.js';
import DialogError from '../dialog/error.js';
import DialogFooter from '../dialog/footer.js';
import DialogTitle from '../dialog/title.js';
import ScrollableContent from '../dialog/scrollablecontent.js';

class SaveDialogContent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
  }

  handleSaveClick(state) {
    const {onSave} = this.props;

    if (onSave) {
      const promise = onSave(state);
      if (is_defined(promise)) {
        promise.then(
          () => this.handleClose(),
          error => this.setError(error)
        );
      }
      else {
        this.handleClose();
      }
    }
  }

  handleErrorClose() {
    this.setState({error: undefined});
  }

  handleClose() {
    const {close} = this.props;
    this.setState({error: undefined});
    close();
  }

  setError(error) {
    this.setState({error: error.message});
  }

  render() {
    const {
      children,
      title,
      moveprops,
    } = this.props;
    const {
      error,
    } = this.state;
    return (
      <State>
        {({
          state,
          onValueChange,
        }) => (
          <DialogContent>
            <DialogTitle
              title={title}
              onCloseClick={this.handleClose}
              {...moveprops}
            />
            {error &&
              <DialogError
                error={error}
                onCloseClick={this.handleErrorClose}
              />
            }
            <ScrollableContent>
              {children({
                data: state,
                onValueChange,
              })}
            </ScrollableContent>
            <DialogFooter
              title={_('Save')}
              onClick={() => this.handleSaveClick(state)}
            />
          </DialogContent>
        )}
      </State>
    );
  }
}

SaveDialogContent.propTypes = {
  close: PropTypes.func.isRequired,
  moveprops: PropTypes.object,
  title: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

const SaveDialog = ({
  children,
  width,
  title,
  visible,
  onClose,
  onSave,
}) => {
  return (
    <Dialog
      visible={visible}
      width={width}
      onClose={onClose}
    >
      {({
        close,
        getMoveProps,
      }) => (
        <SaveDialogContent
          close={close}
          moveprops={getMoveProps()}
          title={title}
          onSave={onSave}
        >
          {children}
        </SaveDialogContent>
      )}
    </Dialog>
  );
};

SaveDialog.propTypes = {
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SaveDialog;

// vim: set ts=2 sw=2 tw=80:
