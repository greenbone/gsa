/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import Portal from 'web/components/portal/portal';

import PropTypes from 'web/utils/proptypes';

import DialogContainer from './container';
import DialogOverlay from './overlay';
import Resizer from './resizer';

const DEFAULT_DIALOG_WIDTH = '800px';
const DEFAULT_DIALOG_HEIGHT = undefined; // use auto height by default
const DEFAULT_DIALOG_MAX_HEIGHT = '400px';
const DEFAULT_DIALOG_MIN_HEIGHT = 250;
const DEFAULT_DIALOG_MIN_WIDTH = 450;

class Dialog extends React.Component {
  constructor(...args) {
    super(...args);

    this.dialogRef = React.createRef();

    this.handleClose = this.handleClose.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDownMove = this.onMouseDownMove.bind(this);
    this.onMouseDownResize = this.onMouseDownResize.bind(this);
    this.onMouseMoveMove = this.onMouseMoveMove.bind(this);
    this.onMouseMoveResize = this.onMouseMoveResize.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.state = this.defaultState();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  defaultState() {
    const {width, height} = this.props;
    return {
      width: isDefined(width) ? width : DEFAULT_DIALOG_WIDTH,
      height: isDefined(height) ? height : DEFAULT_DIALOG_HEIGHT,
    };
  }

  handleClose() {
    const {onClose} = this.props;

    if (onClose) {
      onClose();
    }
  }

  setDialogPosition(x, y) {
    const {current: dialog} = this.dialogRef;

    dialog.style.position = 'absolute';
    dialog.style.left = `${x}px`;
    dialog.style.top = `${y}px`;
    dialog.style.margin = '0';
  }

  onKeyDown(event) {
    if (event.keyCode === KeyCode.ESC) {
      this.handleClose();
      event.preventDefault();
    }
  }

  onMouseDownMove(event) {
    const {current: dialog} = this.dialogRef;
    // eslint-disable-next-line no-bitwise
    if (event.buttons & 1 && dialog !== null) {
      const box = dialog.getBoundingClientRect();
      this.relX = event.pageX - box.left;
      this.relY = event.pageY - box.top;

      this.setDialogPosition(box.left, box.top);

      document.addEventListener('mousemove', this.onMouseMoveMove);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  onMouseDownResize(event) {
    // eslint-disable-next-line no-bitwise
    if (event.buttons & 1) {
      const {current: dialog} = this.dialogRef;
      const box = dialog.getBoundingClientRect();

      this.width = Math.round(box.width);
      this.height = Math.round(box.height);
      this.mousePosX = event.pageX;
      this.mousePosY = event.pageY;

      this.setDialogPosition(box.left, box.top);

      document.addEventListener('mousemove', this.onMouseMoveResize);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  onMouseMoveMove(event) {
    const left = event.pageX - this.relX;
    const top = event.pageY - this.relY;

    const rightBorder = window.outerWidth - DEFAULT_DIALOG_MIN_WIDTH;
    const bottomBorder = window.outerHeight - DEFAULT_DIALOG_MIN_HEIGHT;

    this.setDialogPosition(
      Math.min(Math.max(left, 0), rightBorder),
      Math.min(Math.max(top, 0), bottomBorder),
    );

    event.preventDefault();
  }

  onMouseMoveResize(event) {
    const {
      minHeight = DEFAULT_DIALOG_MIN_HEIGHT,
      minWidth = DEFAULT_DIALOG_MIN_WIDTH,
    } = this.props;

    const differenceX = this.mousePosX - event.pageX;
    const differenceY = this.mousePosY - event.pageY;
    let newWidth = this.width - differenceX;
    let newHeight = this.height - differenceY;

    if (newWidth < minWidth) {
      newWidth = minWidth;
    }
    if (newHeight < minHeight) {
      newHeight = minHeight;
    }

    this.setState({
      width: newWidth,
      height: newHeight,
    });

    event.preventDefault();
  }

  onMouseUp(event) {
    document.removeEventListener('mousemove', this.onMouseMoveMove);
    document.removeEventListener('mousemove', this.onMouseMoveResize);
    document.removeEventListener('mouseup', this.onMouseUp);
    event.preventDefault();
  }

  render() {
    let {height, width} = this.state;

    const {children, resizable = true} = this.props;

    if (!resizable) {
      height = 'auto';
    }

    const maxHeight = isDefined(height) ? undefined : DEFAULT_DIALOG_MAX_HEIGHT;

    return (
      <Portal>
        <DialogOverlay onKeyDown={this.onKeyDown}>
          <DialogContainer
            role="dialog"
            tabIndex="1"
            width={width}
            height={height}
            ref={this.dialogRef}
          >
            {children({
              close: this.handleClose,
              moveProps: {
                onMouseDown: this.onMouseDownMove,
              },
              heightProps: {
                maxHeight,
              },
            })}
            {resizable && <Resizer onMouseDown={this.onMouseDownResize} />}
          </DialogContainer>
        </DialogOverlay>
      </Portal>
    );
  }
}

Dialog.propTypes = {
  height: PropTypes.numberOrNumberString,
  minHeight: PropTypes.numberOrNumberString,
  minWidth: PropTypes.numberOrNumberString,
  resizable: PropTypes.bool,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
