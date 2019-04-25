/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {isDefined, hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const BadgeContainer = styled.div`
  position: relative;
  display: inline-flex;
  margin-right: ${props => props.margin}px;
`;

BadgeContainer.displayName = 'BadgeContainer';

const BadgeIcon = styled.span`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  align-items: center;
  position: absolute;
  font-size: 10px;
  background-color: red;
  font-weight: bold;
  border-radius: 10px;
  min-width: 10px;
  padding: 3px 5px;
  z-index: ${Theme.Layers.higher};
  background-color: ${({backgroundColor = Theme.green}) => backgroundColor};
  color: ${({color = Theme.white}) => color};
  ${({position = 'bottom'}) => position}: ${({radius = 8}) => -radius}px;
  right: ${({margin = 8}) => -margin}px;
`;

BadgeIcon.displayName = 'BadgeIcon';

class Badge extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  componentDidMount() {
    this.calcMargin();
  }

  componentDidUpdate(prev) {
    if (prev.content !== this.props.content) {
      this.calcMargin();
    }
  }

  calcMargin() {
    if (hasValue(this.icon)) {
      const {width} = this.icon.getBoundingClientRect();
      this.setState({margin: width / 2});
    }
  }

  render() {
    const {margin} = this.state;
    const {
      backgroundColor,
      children,
      color,
      content,
      dynamic = true,
      position,
    } = this.props;
    return (
      <BadgeContainer margin={dynamic ? margin : undefined}>
        {children}

        {isDefined(content) && (
          <BadgeIcon
            data-testid="badge-icon"
            innerRef={ref => (this.icon = ref)}
            color={color}
            backgroundColor={backgroundColor}
            position={position}
            margin={dynamic ? margin : undefined}
          >
            {content}
          </BadgeIcon>
        )}
      </BadgeContainer>
    );
  }
}

Badge.propTypes = {
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dynamic: PropTypes.bool,
  position: PropTypes.oneOf(['bottom', 'top']),
};

export default Badge;

// vim: set ts=2 sw=2 tw=80:
