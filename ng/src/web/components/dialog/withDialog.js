/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import logger from 'gmp/log.js';
import {is_defined, KeyCode, exclude_object_props} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../layout/layout.js';

import DialogContainer from './container.js';
import DialogContent from './content.js';
import DialogError from './error.js';
import DialogFooter from './footer.js';
import DialogOverlay from './overlay.js';
import DialogTitle from './title.js';
import Resizer from './resizer.js';
import ScrollableContent from './scrollablecontent.js';

const log = logger.getLogger('web.components.dialog.withDialog');

const DEFAULT_DIALOG_WIDTH = '800px';
const DEFAULT_DIALOG_HEIGHT = '550px';
const DEFAULT_DIALOG_MIN_HEIGHT = 250;
const DEFAULT_DIALOG_MIN_WIDTH = 450;

const exclude_props = [
  'title',
  'footer',
  'width',
  'height',
  'children',
  'onSave',
  'onClose',
];

const withDialog = (options = {}) => Component => {

  class DialogWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.state = {
        data: {},
        visible: false,
      };

      this.handleSave = this.handleSave.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.onErrorClose = this.onErrorClose.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onMouseDownMove = this.onMouseDownMove.bind(this);
      this.onMouseDownResize = this.onMouseDownResize.bind(this);
      this.onMouseMoveMove = this.onMouseMoveMove.bind(this);
      this.onMouseMoveResize = this.onMouseMoveResize.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onOuterClick = this.onOuterClick.bind(this);
      this.onValueChange = this.onValueChange.bind(this);

      this.state = this.defaultState();
    }

    componentDidMount() {
      document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.onKeyDown);
    }

    defaultState() {
      const {defaultState = {}} = options;
      const {
        title,
        footer = _('Save'),
        width = DEFAULT_DIALOG_WIDTH,
      } = {...options, ...this.props};
      return {
        error: undefined,
        footer,
        posX: undefined,
        posY: undefined,
        title,
        visible: false,
        width,
        data: defaultState,
      };
    }

    setError(error) {
      this.setErrorMessage(error.message);
    }

    setErrorMessage(message) {
      this.setState({
        error: message,
        loading: false,
      });
    }

    setValues(new_data) {
      const {data} = this.state;
      this.setState({
        data: {...data, ...new_data},
      });
    }

    setValue(name, value) {
      const {data} = this.state;

      data[name] = value;

      this.setState({data});
    }

    show(init_data = {}, opts = {}) {
      const {
        footer,
        title,
      } = {...this.state, ...opts};

      const {data} = this.state;

      this.setState({
        data: {...data, ...init_data},
        error: undefined,
        footer,
        title,
        visible: true,
        loading: false,
      });
    }

    close() {
      this.setState(this.defaultState());
    }

    onValueChange(value, name) {
      log.debug('value changed', name, value);

      this.setValue(name, value);
    }

    handleClose() {
      const {onClose} = this.props;

      this.close();
      this.setState({loading: false});
      if (onClose) {
        onClose();
      }
    }

    handleSave() {
      const {data} = this.state;
      const {onSave} = this.props;

      if (onSave) {
        const promise = onSave(data);
        if (is_defined(promise)) {
          this.setState({loading: true});
          promise.then(
            () => this.close(),
            error => this.setError(error)
          );
        }
        else {
          this.close();
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
        event.preventDefault();
      }
    }

    onMouseDownMove(event) {
      if (event.buttons & 1) { // eslint-disable-line no-bitwise
        const box = this.dialog.getBoundingClientRect();
        this.relX = event.pageX - box.left;
        this.relY = event.pageY - box.top;

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
        this.fixedPosX = box.left;
        this.fixedPosY = box.top;

        document.addEventListener('mousemove', this.onMouseMoveResize);
        document.addEventListener('mouseup', this.onMouseUp);
        event.preventDefault();
      }
    }

    onMouseMoveMove(event) {
      this.setState({
        posX: event.pageX - this.relX,
        posY: event.pageY - this.relY,
      });
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
        posX: this.fixedPosX,
        posY: this.fixedPosY,
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

    onErrorClose() {
      this.setErrorMessage();
    }

    renderTitle() {
      const {title} = {...this.state, ...this.props};

      if (!is_defined(title)) {
        return null;
      }
      return (
        <DialogTitle
          title={title}
          onCloseClick={this.handleClose}
          onMouseDown={this.onMouseDownMove}
        />
      );
    }

    renderFooter() {
      const {
        footer,
        loading,
      } = {...this.state, ...this.props};

      if (!is_defined(footer)) {
        return null;
      }
      if (loading) {
        return (
          <DialogFooter
            title={footer}
            loading={loading}
          />
        );
      }
      return (
        <DialogFooter
          title={footer}
          onClick={this.handleSave}
        />
      );
    }

    renderError() {
      const {error} = this.state;

      if (!is_defined(error)) {
        return null;
      }
      return (
        <DialogError
          error={error}
          onCloseClick={this.onErrorClose}
        />
      );
    }

    render() {
      const {
        data,
        visible = false,
        posX,
        posY,
      } = this.state;

      if (!visible) {
        return null;
      }

      const {children} = this.props;

      const {
        width = DEFAULT_DIALOG_WIDTH,
        height,
      } = {...this.state, ...this.props};

      const other = exclude_object_props(this.props, exclude_props);

      const c_props = {
        ...other,
        ...data,
        onValueChange: this.onValueChange,
      };

      const component = is_defined(Component) ?
        React.createElement(Component, c_props) :
        React.cloneElement(React.Children.only(children), c_props);

      return (
        <div className="dialog">
          <DialogOverlay
            onClick={this.onOuterClick}
            onKeyDown={this.onKeyDown}
          >
            <DialogContainer
              tabIndex="1"
              role="dialog"
              width={width}
              height={height}
              posX={posX}
              posY={posY}
              innerRef={ref => this.dialog = ref}>
              <DialogContent>

                {this.renderTitle()}

                {this.renderError()}

                <Layout
                  flex="column"
                  align={['center', 'start']}
                  grow="1"
                >
                  <ScrollableContent
                    maxHeight={is_defined(height) ?
                      undefined : DEFAULT_DIALOG_HEIGHT
                    }
                  >
                    {component}
                  </ScrollableContent>
                </Layout>

                {this.renderFooter()}
                <Resizer
                  onMouseDown={this.onMouseDownResize}/>
              </DialogContent>
            </DialogContainer>
          </DialogOverlay>
        </div>
      );
    }
  };

  DialogWrapper.propTypes = {
    footer: PropTypes.string,
    title: PropTypes.string,
    width: PropTypes.string,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
  };

  return DialogWrapper;
};

export default withDialog;

// vim: set ts=2 sw=2 tw=80:
