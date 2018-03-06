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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

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

    this.state = {
      loading: false,
    };

    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
  }

  handleSaveClick(state) {
    const {onSave} = this.props;

    if (onSave && !this.state.loading) {
      const promise = onSave(state);
      if (is_defined(promise)) {
        this.setState({loading: true});
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
    this.setState({
      error: undefined,
      loading: false,
    });
    close();
  }

  setError(error) {
    this.setState({
      error: error.message,
      loading: false,
    });
  }

  render() {
    const {
      buttonTitle,
      children,
      defaultValues,
      moveProps,
      heightProps,
      title,
      values,
    } = this.props;
    const {
      error,
    } = this.state;
    return (
      <State {...defaultValues}>
        {({
          state,
          onValueChange,
        }) => {
          const childValues = {...state, ...values};
          return (
            <DialogContent>
              <DialogTitle
                title={title}
                onCloseClick={this.handleClose}
                {...moveProps}
              />
              {error &&
                <DialogError
                  error={error}
                  onCloseClick={this.handleErrorClose}
                />
              }
              <ScrollableContent
                {...heightProps}
              >
                {children({
                  data: state, // TODO should be removed in future. savedialogs should switch to use values
                  values: childValues,
                  onValueChange,
                })}
              </ScrollableContent>
              <DialogFooter
                title={buttonTitle}
                loading={this.state.loading}
                onClick={() => this.handleSaveClick(childValues)}
              />
            </DialogContent>
          );
         }}
      </State>
    );
  }
}

SaveDialogContent.propTypes = {
  buttonTitle: PropTypes.string,
  close: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
  heightProps: PropTypes.object,
  moveProps: PropTypes.object,
  title: PropTypes.string.isRequired,
  values: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

const SaveDialog = ({
  buttonTitle = _('Save'),
  children,
  width,
  title,
  visible,
  initialData,
  defaultValues = initialData,
  values,
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
        moveProps,
        heightProps,
      }) => (
        <SaveDialogContent
          buttonTitle={buttonTitle}
          close={close}
          defaultValues={defaultValues}
          moveProps={moveProps}
          heightProps={heightProps}
          title={title}
          values={values}
          onSave={onSave}
        >
          {children}
        </SaveDialogContent>
      )}
    </Dialog>
  );
};

SaveDialog.propTypes = {
  buttonTitle: PropTypes.string,
  defaultValues: PropTypes.object, // default values for uncontrolled values
  initialData: PropTypes.object, // should not be used anymore. use defaultValues instead.
  title: PropTypes.string.isRequired,
  values: PropTypes.object, // should be used for controlled values
  visible: PropTypes.bool.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SaveDialog;

// vim: set ts=2 sw=2 tw=80:
