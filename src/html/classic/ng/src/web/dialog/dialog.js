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

import {KeyCode, is_defined} from '../../utils.js';
import _ from '../../locale.js';
import logger from '../../log.js';

import PropTypes from '../proptypes.js';
import {render_options} from '../render.js';

import DialogError from './error.js';
import DialogFooter from './footer.js';
import DialogTitle from './title.js';

import PromiseFactory from '../../gmp/promise.js';

import './css/dialog.css';

const log = logger.getLogger('web.dialog');

export class Dialog extends React.Component {

  constructor(props) {
    super(props);

    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onOuterClick = this.onOuterClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onErrorClose = this.onErrorClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.state = this.defaultState();
  }

  defaultState() {
    let {title, footer, width = 800} = this.props;
    return {
      visible: false,
      error: undefined,
      width,
      title,
      footer,
      posX: undefined,
      posY: undefined,
    };
  }

  loadData() {
    // overwrite to load data via gmp
    this.setState({visible: true, error: undefined});
  }

  show(options = {}) {
    let {title, footer} = options;
    this.setState({title, footer});
    this.loadData();
  }

  close() {
    this.setState(this.defaultState());
  }

  save() {
    return PromiseFactory.resolve();
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
    else {
      this.save().then(data => {
        if (this.props.onSave) {
          this.props.onSave(data);
        }
      }).catch(error => {
        log.error('Error while saving data.',
          error.message, error.stack, error);
      });
    }
  }

  onValueChange(value, name) {
    log.debug('value changed', name, value);
    this.setState({[name]: value});
  }

  renderOptions(list, default_opt_value, default_opt = '--') {
    return render_options(list, default_opt_value, default_opt);
  }

  renderTitle() {
    let {title} = this.state;

    return (
      <DialogTitle onCloseClick={this.handleClose} title={title}
        onMouseDown={this.onMouseDown}/>
    );
  }

  renderFooter() {
    let {footer} = this.state;

    return (
      <DialogFooter onSaveClick={this.handleSave} title={footer}/>
    );
  }

  renderSubDialogs() {
    return null;
  }

  renderContent() {
    return null;
  }

  render() {
    let {visible = false, error, width, posX, posY} = this.state;
    let {children, showTitle = true, showFooter = true} = this.props;
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
          onClick={this.onOuterClick} onKeyDown={this.onKeyDown}
          tabIndex="0" role="dialog">
          <div className="dialog-container" style={style} tabIndex="1"
            ref={ref => this.dialog = ref}>
            {showTitle && this.renderTitle()}
            <DialogError error={error} onCloseClick={this.onErrorClose}/>
            <div className="dialog-content">
              {this.renderContent()}
              {children}
            </div>
            {showFooter && this.renderFooter()}
          </div>
        </div>
        {this.renderSubDialogs()}
      </div>
    );
  }
}

Dialog.propTypes = {
  visible: React.PropTypes.bool,
  title: React.PropTypes.string,
  footer: React.PropTypes.string,
  showTitle: React.PropTypes.bool,
  showFooter: React.PropTypes.bool,
  onSave: React.PropTypes.func,
  onSaveClick: React.PropTypes.func,
  onClose: React.PropTypes.func,
  onCloseClick: React.PropTypes.func,
  width: PropTypes.number,
  error: React.PropTypes.string,
};

Dialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export const withDialog = (Component, options = {}) => {

  class DialogWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.state = {
        data: {},
      };

      this.handleSave = this.handleSave.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
    }

    setError(error) {
      this.dialog.showErrorMessageFromRejection(error);
    }

    show(data, opts) {
      if (!is_defined(data)) {
        data = {};
      }
      this.setState({data});
      this.dialog.show(opts);
    }

    onValueChange(value, name) {
      let {data} = this.state;
      data[name] = value;
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
          this.dialog.close();
        }
      }
    }

    render() {
      let {data} = this.state;
      let {onClose, title = options.title, footer = options.footer,
        ...other} = this.props;
      return (
        <Dialog
          ref={ref => this.dialog = ref}
          title={title}
          footer={footer}
          width={800}
          onCloseClick={onClose}
          onSaveClick={this.handleSave}>
          <Component
            {...other}
            {...data}
            onValueChange={this.onValueChange}/>
        </Dialog>
      );
    }
  };

  DialogWrapper.propTypes = {
    title: React.PropTypes.string,
    footer: React.PropTypes.string,
    onSave: React.PropTypes.func,
    onClose: React.PropTypes.func,
  };

  return DialogWrapper;
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
