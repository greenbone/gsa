/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {KeyCode, has_value, is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Portal from '../portal/portal';

import DialogContainer from './container.js';
import DialogOverlay from './overlay.js';
import Resizer from './resizer.js';

const DEFAULT_DIALOG_WIDTH = '800px';
const DEFAULT_DIALOG_HEIGHT = undefined; // use auto height by default
const DEFAULT_DIALOG_MAX_HEIGHT = '550px';
const DEFAULT_DIALOG_MIN_HEIGHT = 250;
const DEFAULT_DIALOG_MIN_WIDTH = 450;

class Dialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleClose = this.handleClose.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDownMove = this.onMouseDownMove.bind(this);
    this.onMouseDownResize = this.onMouseDownResize.bind(this);
    this.onMouseMoveMove = this.onMouseMoveMove.bind(this);
    this.onMouseMoveResize = this.onMouseMoveResize.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onOuterClick = this.onOuterClick.bind(this);

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
      width: is_defined(width) ? width : DEFAULT_DIALOG_WIDTH,
      height: is_defined(height) ? height : DEFAULT_DIALOG_HEIGHT,
    };
  }

  handleClose() {
    const {onClose} = this.props;

    this.setState(this.defaultState());

    if (onClose) {
      onClose();
    }
  }

  setDialogPosition(x, y) {
    this.dialog.style.position = 'absolute';
    this.dialog.style.left = `${x}px`;
    this.dialog.style.top = `${y}px`;
    this.dialog.style.margin = '0';
  }

  onOuterClick(event) {
    if (event.target === event.currentTarget) {
      this.handleClose();
      event.preventDefault();
    }
  }

  onKeyDown(event) {
    if (event.keyCode === KeyCode.ESC) {
      this.handleClose();
      event.preventDefault();
    }
  }

  onMouseDownMove(event) {
    if ((event.buttons & 1) && has_value(this.dialog)) { // eslint-disable-line no-bitwise
      const box = this.dialog.getBoundingClientRect();
      this.relX = event.pageX - box.left;
      this.relY = event.pageY - box.top;

      const left = box.left + window.scrollX;
      const top = box.top + window.scrollY;

      this.setDialogPosition(left, top);

      document.addEventListener('mousemove', this.onMouseMoveMove);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  onMouseDownResize(event) {
    if (event.buttons & 1) { // eslint-disable-line no-bitwise
      const box = this.dialog.getBoundingClientRect();

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

    this.setDialogPosition(left, top);

    event.preventDefault();
  }

  onMouseMoveResize(event) {
    const differenceX = this.mousePosX - event.pageX;
    const differenceY = this.mousePosY - event.pageY;
    let newWidth = this.width - differenceX;
    let newHeight = this.height - differenceY;

    if (newWidth < DEFAULT_DIALOG_MIN_WIDTH) {
      newWidth = DEFAULT_DIALOG_MIN_WIDTH;
    }
    if (newHeight < DEFAULT_DIALOG_MIN_HEIGHT) {
      newHeight = DEFAULT_DIALOG_MIN_HEIGHT;
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
    let {
      height,
      width,
    } = this.state;

    const {
      children,
      resizable = true,
      visible,
    } = this.props;

    if (!resizable) {
      height = 'auto';
    }

    if (!visible) {
      return null;
    }

    const maxHeight = is_defined(height) ?
      undefined : DEFAULT_DIALOG_MAX_HEIGHT;

    return (
      <Portal>
        <DialogOverlay
          onClick={this.onOuterClick}
          onKeyDown={this.onKeyDown}
        >
          <DialogContainer
            role="dialog"
            tabIndex="1"
            width={width}
            height={height}
            innerRef={ref => this.dialog = ref}>
            {children({
              close: this.handleClose,
              moveProps: {
                onMouseDown: this.onMouseDownMove,
              },
              heightProps: {
                maxHeight,
              },
            })}
            {resizable &&
              <Resizer onMouseDown={this.onMouseDownResize}/>
            }
          </DialogContainer>
        </DialogOverlay>
      </Portal>
    );
  }
};

Dialog.propTypes = {
  height: PropTypes.numberOrNumberString,
  resizable: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
