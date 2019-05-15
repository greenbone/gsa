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

import {isDefined} from 'gmp/utils/identity';

import State from 'web/utils/state';
import PropTypes from 'web/utils/proptypes';

import ErrorBoundary from 'web/components/error/errorboundary';

import Dialog from '../dialog/dialog';
import DialogContent from '../dialog/content';
import DialogError from '../dialog/error';
import DialogFooter from '../dialog/twobuttonfooter';
import DialogTitle from '../dialog/title';
import ScrollableContent from '../dialog/scrollablecontent';

class SaveDialogContent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loading: false,
    };

    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.prevError) {
      return {
        error: props.error,
        prevError: props.error,
        loading: false,
      };
    }
    return null;
  }

  handleSaveClick(state) {
    const {onSave} = this.props;

    if (onSave && !this.state.loading) {
      const promise = onSave(state);
      if (isDefined(promise)) {
        this.setState({loading: true});

        promise.catch(error => this.setError(error));
      }
    }
  }

  handleErrorClose() {
    const {onErrorClose} = this.props;
    if (isDefined(onErrorClose)) {
      onErrorClose();
    } else {
      this.setState({error: undefined});
    }
  }

  setError(error) {
    const {onError} = this.props;

    this.setState({
      loading: false,
    });

    if (onError) {
      onError(error);
    } else {
      this.setState({
        error: error.message,
      });
    }
  }

  render() {
    const {
      buttonTitle,
      children,
      close,
      defaultValues,
      moveProps,
      heightProps,
      title,
      values,
    } = this.props;
    const {error} = this.state;
    return (
      <State {...defaultValues}>
        {({state, onValueChange}) => {
          const childValues = {...state, ...values};
          return (
            <DialogContent>
              <DialogTitle title={title} onCloseClick={close} {...moveProps} />
              {error && (
                <DialogError
                  error={error}
                  onCloseClick={this.handleErrorClose}
                />
              )}
              <ErrorBoundary message={_('An error occurred in this dialog.')}>
                <ScrollableContent {...heightProps}>
                  {children({
                    values: childValues,
                    onValueChange,
                  })}
                </ScrollableContent>
              </ErrorBoundary>
              <DialogFooter
                loading={this.state.loading}
                rightButtonTitle={buttonTitle}
                onLeftButtonClick={close}
                onRightButtonClick={() => this.handleSaveClick(childValues)}
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
  error: PropTypes.string,
  heightProps: PropTypes.object,
  moveProps: PropTypes.object,
  title: PropTypes.string.isRequired,
  values: PropTypes.object,
  onError: PropTypes.func,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

const SaveDialog = ({
  buttonTitle = _('Save'),
  children,
  defaultValues,
  error,
  minHeight,
  minWidth,
  title,
  values,
  width,
  onClose,
  onError,
  onErrorClose,
  onSave,
}) => {
  return (
    <Dialog
      width={width}
      minHeight={minHeight}
      minWidth={minWidth}
      onClose={onClose}
    >
      {({close, moveProps, heightProps}) => (
        <SaveDialogContent
          buttonTitle={buttonTitle}
          close={close}
          defaultValues={defaultValues}
          error={error}
          moveProps={moveProps}
          heightProps={heightProps}
          title={title}
          values={values}
          onErrorClose={onErrorClose}
          onError={onError}
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
  error: PropTypes.string, // for errors controlled from parent (onErrorClose must be used if set)
  minHeight: PropTypes.numberOrNumberString,
  minWidth: PropTypes.numberOrNumberString,
  title: PropTypes.string.isRequired,
  values: PropTypes.object, // should be used for controlled values
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default SaveDialog;

// vim: set ts=2 sw=2 tw=80:
