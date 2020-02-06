/* Copyright (C) 2020 Greenbone Networks GmbH
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

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledG = styled.g`
  & line {
    stroke: ${props => (props.isSelected ? Theme.mediumBlue : Theme.darkGray)};
  }
  &:hover line {
    stroke: ${Theme.mediumBlue};
  }
`;

const Edge = ({cursor, isSelected = false, source, target, onMouseDown}) => {
  return (
    <StyledG isSelected={isSelected} cursor={cursor} onMouseDown={onMouseDown}>
      <line
        data-testid="bpm-edge-line"
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        fill={Theme.darkGray}
        strokeWidth="4px"
      />
    </StyledG>
  );
};

Edge.propTypes = {
  cursor: PropTypes.string,
  isSelected: PropTypes.bool,
  name: PropTypes.string,
  radius: PropTypes.number,
  source: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    .isRequired,
  target: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    .isRequired,
  onMouseDown: PropTypes.func,
};

export default Edge;

// vim: set ts=2 sw=2 tw=80:
