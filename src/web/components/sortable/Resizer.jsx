/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {throttleAnimation} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const ResizeContainer = styled.div`
  cursor: row-resize;
  height: 10px;
  width: 100%;
  z-index: ${Theme.Layers.higher};
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

const ResizeIcon = styled.span`
  height: 2px;
  width: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;

class Resizer extends React.Component {
  static propTypes = {
    onResize: PropTypes.func,
  };

  constructor(...args) {
    super(...args);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.notifyResize = throttleAnimation(this.notifyResize.bind(this));
  }

  handleMouseDown(event) {
    if (event.buttons & 1) {
      this.startY = event.pageY;

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      event.preventDefault();
    }
  }

  handleMouseMove(event) {
    const {onResize} = this.props;

    event.preventDefault();

    if (isDefined(onResize)) {
      this.notifyResize(event.pageY);
    }
  }

  notifyResize(pageY) {
    const {onResize} = this.props;

    const diffY = pageY - this.startY;
    this.startY = pageY;
    onResize(diffY);
  }

  handleMouseUp(event) {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    event.preventDefault();
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    return (
      <ResizeContainer data-testid="resizer" onMouseDown={this.handleMouseDown}>
        <ResizeIcon />
      </ResizeContainer>
    );
  }
}

export default Resizer;
