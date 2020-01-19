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

const DEFAULT_COLOR = Theme.green;

const StyledText = styled.text`
  font-family: ${Theme.Font.default};
  text-anchor: middle;
  font-size: 1em;
  user-select: none;
`;

const StyledCircle = styled.circle`
  cursor: ${props => props.cursor};
  stroke: ${props => (props.isSelected ? Theme.mediumBlue : undefined)}
  stroke-width: ${props => (props.isSelected ? '5px' : undefined)}
`;

const StyledG = styled.g`
  &:hover {
    ${StyledCircle} {
      stroke: ${Theme.mediumBlue};
      stroke-width: 5px;
      cursor: ${props => props.cursor};
    }
    ${StyledText} {
      cursor: ${props => props.cursor};
    }
  }
`;

const ProcessNode = ({
  color = DEFAULT_COLOR,
  comment,
  cursor,
  id,
  isSelected = false,
  name,
  radius,
  x,
  y,
  onMouseDown,
  onMouseUp,
}) => {
  return (
    <StyledG
      id={id}
      name={name}
      cursor={cursor}
      isSelected={isSelected}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <StyledCircle
        isSelected={isSelected}
        cx={x}
        cy={y}
        fill={color}
        r={radius}
      />
      <StyledText fontWeight="bold" x={x} y={y}>
        {name}
      </StyledText>
      <StyledText fontWeight="normal" x={x} y={y + 35}>
        {comment}
      </StyledText>
    </StyledG>
  );
};

ProcessNode.propTypes = {
  color: PropTypes.string,
  comment: PropTypes.string,
  cursor: PropTypes.string,
  id: PropTypes.string,
  isSelected: PropTypes.bool,
  name: PropTypes.string,
  radius: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
};

export default ProcessNode;

// vim: set ts=2 sw=2 tw=80:
