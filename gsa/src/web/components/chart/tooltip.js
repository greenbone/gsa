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

import {hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Portal from 'web/components/portal/portal';

const ToolTipText = styled.div`
  box-sizing: border-box;
  font-weight: bold;
  padding: 3px;
  background: ${Theme.darkGray};
  color: ${Theme.white};
  border-radius: 2px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  line-height: 1;
`;

ToolTipText.displayName = 'ToolTipText';

const ToolTipArrow = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  line-height: 1;
  font-size: 10px;
  color: ${Theme.darkGray};
`;

ToolTipArrow.displayName = 'ToolTipArrow';

const ToolTipContainer = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  z-index: ${Theme.Layers.onTop};
`;

ToolTipContainer.displayName = 'ToolTipContainer';

const ToolTipDisplay = ({children, ...props}) => (
  <ToolTipContainer {...props}>
    <ToolTipText>{children}</ToolTipText>
    <ToolTipArrow>▼</ToolTipArrow>
  </ToolTipContainer>
);

class ToolTip extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    content: PropTypes.elementOrString,
  };

  constructor(...args) {
    super(...args);

    this.state = {
      visible: false,
    };

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);

    this.target = React.createRef();
    this.tooltip = React.createRef();
  }

  show() {
    this.setState({visible: true});
  }

  hide() {
    this.setState({visible: false});
  }

  setPosition() {
    const target = this.target.current;
    const tooltip = this.tooltip.current;

    if (!hasValue(target) || !hasValue(tooltip)) {
      // ensure both refs have been set to not crash
      return;
    }

    const rect = target.getBoundingClientRect();
    const top = rect.top - tooltip.offsetHeight + window.scrollY;
    const left =
      rect.left + (rect.width - tooltip.offsetWidth) / 2 + window.scrollX;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  componentDidUpdate() {
    if (this.state.visible) {
      this.setPosition();
    }
  }

  render() {
    const {children, content} = this.props;
    const {visible} = this.state;
    return (
      <React.Fragment>
        {content && visible && (
          <Portal>
            <ToolTipDisplay innerRef={this.tooltip}>{content}</ToolTipDisplay>
          </Portal>
        )}
        {children({
          show: this.show,
          hide: this.hide,
          targetRef: this.target,
        })}
      </React.Fragment>
    );
  }
}

export default ToolTip;

// vim: set ts=2 sw=2 tw=80:
