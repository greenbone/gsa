/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {KeyCode, has_value} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import DialogContainer from './container.js';
import DialogOverlay from './overlay.js';

const DEFAULT_DIALOG_WIDTH = '800px';

class Dialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleClose = this.handleClose.bind(this);

    this.getMoveProps = this.getMoveProps.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
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
    const {
      width = DEFAULT_DIALOG_WIDTH,
      visible = false,
    } = this.props;
    return {
      posX: undefined,
      posY: undefined,
      visible,
      width,
    };
  }

  handleClose() {
    const {onClose} = this.props;

    if (onClose) {
      onClose();
    }

    this.setState(this.defaultState());
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

  onMouseDown(event) {
    if ((event.buttons & 1) && has_value(this.dialog)) { // eslint-disable-line no-bitwise
      const box = this.dialog.getBoundingClientRect();
      this.relX = event.pageX - box.left;
      this.relY = event.pageY - box.top;
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  onMouseMove(event) {
    this.setState({
      posX: event.pageX - this.relX,
      posY: event.pageY - this.relY,
    });
    event.preventDefault();
  }

  onMouseUp(event) {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    event.preventDefault();
  }

  getMoveProps() {
    return {
      onMouseDown: this.onMouseDown,
    };
  }

  componentWillReceiveProps(next) {
    if (next.visible !== this.props.visible &&
      next.visible !== this.state.visible) {
      this.setState({visible: next.visible});
    }
  }

  render() {
    const {
      visible = false,
      posX,
      posY,
    } = this.state;

    if (!visible) {
      return null;
    }

    const {children} = this.props;

    const {width} = {...this.state};

    return (
      <DialogOverlay
        onClick={this.onOuterClick}
        onKeyDown={this.onKeyDown}
      >
        <DialogContainer
          role="dialog"
          tabIndex="1"
          width={width}
          posX={posX}
          posY={posY}
          innerRef={ref => this.dialog = ref}>
          {children({
            close: this.handleClose,
            getMoveProps: this.getMoveProps,
          })}
        </DialogContainer>
      </DialogOverlay>
    );
  }
};

Dialog.propTypes = {
  visible: PropTypes.bool,
  width: PropTypes.string,
  onClose: PropTypes.func,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
