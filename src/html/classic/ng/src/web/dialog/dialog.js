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

import {KeyCode, is_defined, extend} from '../../utils.js';
import _ from '../../locale.js';
import logger from '../../log.js';

import PropTypes from '../proptypes.js';

import DialogError from './error.js';
import DialogFooter from './footer.js';
import DialogTitle from './title.js';

import './css/dialog.css';

const log = logger.getLogger('web.dialog');

const DEFAULT_DIALOG_WIDTH = 800;

export class Dialog extends React.Component {

  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.onErrorClose = this.onErrorClose.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onOuterClick = this.onOuterClick.bind(this);

    this.state = this.defaultState();
  }

  defaultState() {
    let {title, footer, width = DEFAULT_DIALOG_WIDTH} = this.props;
    return {
      error: undefined,
      footer,
      posX: undefined,
      posY: undefined,
      title,
      visible: false,
      width,
    };
  }

  show(options = {}) {
    let {
      content,
      footer = this.props.footer,
      title = this.props.title,
    } = options;

    this.setState({
      content,
      error: undefined,
      footer,
      title,
      visible: true,
    });
  }

  close() {
    this.setState(this.defaultState());
  }

  setErrorMessage(message) {
    this.setState({error: message});
  }

  showErrorMessageFromRejection(rej) {
    this.setErrorMessage(rej.message);
  }

  handleClose(event) {
    if (this.props.onCloseClick) {
      this.props.onCloseClick();
    }
    else {
      this.close();
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  onOuterClick(event) {
    if (event.target === event.currentTarget) {
      this.handleClose(event);
    }
  }

  onKeyDown(event) {
    if (event.keyCode === KeyCode.ESC) {
      this.handleClose(event);
    }
  }

  onMouseDown(event) {
    if (event.buttons & 1) { // eslint-disable-line no-bitwise
      let box = this.dialog.getBoundingClientRect();
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

  onErrorClose() {
    this.setErrorMessage();
  }

  handleSave(event) {
    event.preventDefault();

    if (this.props.onSaveClick) {
      this.props.onSaveClick();
    }
  }

  renderTitle() {
    let {title} = this.state;

    if (title) {
      return (
        <DialogTitle
          onCloseClick={this.handleClose}
          title={title}
          onMouseDown={this.onMouseDown}/>
      );
    }
    return null;
  }

  renderFooter() {
    let {footer} = this.state;

    if (footer) {
      return (
        <DialogFooter onSaveClick={this.handleSave} title={footer}/>
      );
    }
    return null;
  }

  render() {
    let {
      error,
      content = this.props.children,
      posX,
      posY,
      visible = false,
      width,
    } = this.state;
    let style = {};

    if (!visible) {
      return null;
    }

    if (width) {
      style.width = width;
    }

    if (is_defined(posX) || is_defined(posY)) {
      style.position = 'absolute';
      style.top = posY;
      style.left = posX;
      style.margin = 0;
    }
    return (
      <div className="dialogs">
        <div className="dialog dialog-modal"
          onClick={this.onOuterClick}
          onKeyDown={this.onKeyDown}
          tabIndex="0"
          role="dialog">
          <div className="dialog-container"
            style={style}
            tabIndex="1"
            ref={ref => this.dialog = ref}>
            {this.renderTitle()}
            <DialogError
              error={error}
              onCloseClick={this.onErrorClose}/>
            <div className="dialog-content">
              {content}
            </div>
            {this.renderFooter()}
          </div>
        </div>
      </div>
    );
  }
}

Dialog.propTypes = {
  visible: React.PropTypes.bool,
  title: PropTypes.stringOrFalse,
  footer: PropTypes.stringOrFalse,
  onSaveClick: React.PropTypes.func,
  onClose: React.PropTypes.func,
  onCloseClick: React.PropTypes.func,
  width: PropTypes.number,
  error: PropTypes.stringOrFalse,
};

export const withDialog = (Component, options = {}) => {

  class DialogWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.state = {
        data: {},
        visible: false,
      };

      this.handleSave = this.handleSave.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
    }

    setError(error) {
      this.dialog.showErrorMessageFromRejection(error);
    }

    setValue(name, value) {
      this.onValueChange(value, name);
    }

    setValues(new_data) {
      let {data} = this.state;
      data = extend({}, data, new_data);
      this.setState({data});
    }

    show(data, opts) {
      let {defaultState = {}} = options;

      data = extend({}, defaultState, data);

      this.setState({data, visible: true});
      this.dialog.show(opts);
    }

    close() {
      this.setState({visible: false});
      this.dialog.close();
    }

    onValueChange(value, name) {
      let {data} = this.state;
      data[name] = value;

      log.debug('value changed', name, value);

      this.setState({data});
    }

    handleSave() {
      let {data} = this.state;
      let {onSave} = this.props;

      if (onSave) {
        let promise = onSave(data);
        if (is_defined(promise)) {
          promise.then(
            () => this.dialog.close(),
            error => this.setError(error)
          );
        }
        else {
          onSave(data);
          this.close();
        }
      }
    }

    render() {
      let {data, visible = false} = this.state;
      let {onClose, title = options.title, footer = options.footer,
        width = options.width, ...other} = this.props;

      return (
        <Dialog
          ref={ref => this.dialog = ref}
          title={title}
          footer={footer}
          width={width}
          onCloseClick={onClose}
          onSaveClick={this.handleSave}>
          {visible &&
            <Component
              {...other}
              {...data}
              onValueChange={this.onValueChange}/>
          }
        </Dialog>
      );
    }
  };

  DialogWrapper.propTypes = {
    title: React.PropTypes.string,
    footer: React.PropTypes.string,
    width: PropTypes.number,
    onSave: React.PropTypes.func,
    onClose: React.PropTypes.func,
  };

  return DialogWrapper;
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
