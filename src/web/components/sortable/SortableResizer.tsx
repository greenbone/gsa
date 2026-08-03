/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {throttleAnimation} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import Theme from 'web/utils/theme';

interface SortableResizerProps {
  onResize?: (diffY: number) => void;
}

const StyledResizeContainer = styled.div`
  cursor: row-resize;
  height: 10px;
  width: 100%;
  z-index: ${Theme.Layers.higher};
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

const StyledResizeIcon = styled.span`
  height: 2px;
  width: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;

class SortableResizer extends React.Component<SortableResizerProps> {
  startY = 0;

  constructor(props: SortableResizerProps) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.notifyResize = throttleAnimation(this.notifyResize.bind(this));
  }

  handleMouseDown(event: React.MouseEvent) {
    if (event.buttons & 1) {
      this.startY = event.pageY;

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      event.preventDefault();
    }
  }

  handleMouseMove(event: MouseEvent) {
    const {onResize} = this.props;

    event.preventDefault();

    if (isDefined(onResize)) {
      this.notifyResize(event.pageY);
    }
  }

  notifyResize(pageY: number) {
    const {onResize} = this.props;

    const diffY = pageY - this.startY;
    this.startY = pageY;
    if (isDefined(onResize)) {
      onResize(diffY);
    }
  }

  handleMouseUp(event: MouseEvent) {
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
      <StyledResizeContainer
        data-testid="resizer"
        onMouseDown={this.handleMouseDown}
      >
        <StyledResizeIcon />
      </StyledResizeContainer>
    );
  }
}

export default SortableResizer;
