/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {has_value} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';

import Portal from '../portal/portal';

const ToolTipText = glamorous.div({
  boxSizing: 'border-box',
  fontWeight: 'bold',
  padding: '3px',
  background: Theme.darkGray,
  color: Theme.white,
  borderRadius: '2px',
  boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.2)',
  lineHeight: 1,
});

const ToolTipArrow = glamorous.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'start',
  lineHeight: 1,
  fontSize: '10px',
  color: Theme.darkGray,
});

const ToolTipContainer = glamorous.div({
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
}, ({top = 0, left = 0, visible = false}) => ({
  top,
  left,
  opacity: visible ? 1 : 0,
}));

const ToolTipDisplay = ({children, ...props}) => (
  <ToolTipContainer {...props}>
    <ToolTipText>
      {children}
    </ToolTipText>
    <ToolTipArrow>▼</ToolTipArrow>
  </ToolTipContainer>
);

class ToolTip extends React.Component {

  static propTypes = {
    children: PropTypes.func.isRequired,
    content: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  };

  constructor(...args) {
    super(...args);

    this.state = {
      visible: false,
    };

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.setTargetRef = this.setTargetRef.bind(this);
  }

  show() {
    this.setState({visible: true});
  }

  hide() {
    this.setState({visible: false});
  }

  setTargetRef(ref) {
    this.target = ref;
  }

  position() {
    if (!has_value(this.target) || !has_value(this.tooltip)) {
      // initial rendering
      return {};
    }

    const rect = this.target.getBoundingClientRect();
    return {
      top: rect.top - this.tooltip.offsetHeight,
      left: rect.left + (rect.width - this.tooltip.offsetWidth) / 2,
    };
  }

  render() {
    const {children, content} = this.props;
    const {visible} = this.state;
    return (
      <React.Fragment>
        {content &&
          <Portal>
            <ToolTipDisplay
              {...this.position()}
              visible={visible}
              innerRef={ref => this.tooltip = ref}
            >
              {content}
            </ToolTipDisplay>
          </Portal>
        }
        {children({
          show: this.show,
          hide: this.hide,
          targetRef: this.setTargetRef,
        })}
      </React.Fragment>
    );
  }
}

export default ToolTip;

// vim: set ts=2 sw=2 tw=80:
