/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import styled, {keyframes} from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const SnackbarContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100px;
  margin: 5px 50px;
  padding: 10px 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  z-index: ${Theme.Layers.menu};
  box-shadow: 5px 5px 10px ${Theme.mediumGray};
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px solid ${Theme.green};
  background-color: ${Theme.darkGray};
  color: ${Theme.white};
  font-family: ${Theme.Font.dialog};
  animation: ${keyframes({
      '0%': {bottom: '-110px'},
      '20%': {bottom: '10px'},
      '80%': {bottom: '10px'},
      '100%': {bottom: '-110px'},
    })}
    5s ease-in-out;
`;

class Snackbar extends React.Component {
  componentDidMount() {
    const {close} = this.props;
    setTimeout(() => close(), 5000);
  }

  render() {
    const {children} = this.props;
    return (
      <SnackbarContainer data-testid="snackbar-container">
        {children}
      </SnackbarContainer>
    );
  }
}

Snackbar.propTypes = {
  close: PropTypes.func,
};

class SnackbarCreator extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      isSnackbarVisible: false,
      displayedMessage: undefined,
      queue: [],
      message: this.props.message,
    };

    this.handleClose = this.handleClose.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.message !== state.message) {
      if (isDefined(props.message.text)) {
        const tmpQueue = state.queue;
        tmpQueue.push(props.message.text);
        return {
          isSnackbarVisible: true,
          queue: tmpQueue,
          displayedMessage: tmpQueue[0],
          message: props.message,
        };
      }
    }
    return null;
  }

  componentDidUpdate() {
    const tmpQueue = this.state.queue;
    if (!this.state.isSnackbarVisible && tmpQueue.length > 0) {
      this.setState({
        isSnackbarVisible: true,
        queue: tmpQueue,
        displayedMessage: tmpQueue[0],
      });
    }
  }

  handleClose() {
    const tmpQueue = this.state.queue;
    tmpQueue.shift();
    this.setState({
      isSnackbarVisible: false,
      queue: tmpQueue,
    });
  }

  render() {
    return (
      <span>
        {this.state.isSnackbarVisible && (
          <Snackbar close={this.handleClose}>
            {this.state.displayedMessage}
          </Snackbar>
        )}
      </span>
    );
  }
}

/* message has to be an object to make it possible 
to distinguish two different inputs with the same text,
for example clicking the same button twice */

SnackbarCreator.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
  }),
};

export default SnackbarCreator;
