/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import {throttleAnimation} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

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
    // eslint-disable-next-line no-bitwise
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
      <ResizeContainer onMouseDown={this.handleMouseDown}>
        <ResizeIcon />
      </ResizeContainer>
    );
  }
}

export default Resizer;

// vim: set ts=2 sw=2 tw=80:
