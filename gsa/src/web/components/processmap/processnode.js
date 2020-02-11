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
import styled, {keyframes} from 'styled-components';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledText = styled.text`
  font-family: ${Theme.Font.default};
  text-anchor: middle;
  font-size: 1em;
  user-select: none;
`;

const StyledCircle = styled.circle`
  cursor: ${props => props.cursor};
  stroke: ${props => (props.isSelected ? Theme.mediumBlue : undefined)};
  stroke-width: ${props => (props.isSelected ? '5px' : undefined)};
  animation: ${props =>
      keyframes({
        '0%': {
          fill: Theme.white,
          stroke: Theme.white,
          strokeWidth: '0px',
        },
        '50%': {
          stroke: Theme.mediumBlue,
          strokeWidth: '7px',
        },
        '100%': {
          fill: props.fill,
          stroke: Theme.white,
          strokeWidth: '0px',
        },
      })}
    3s ease;
`;

const StyledG = styled.g`
  &:hover {
    ${StyledCircle} {
      stroke: ${props =>
        props.isSelected ? Theme.mediumBlue : Theme.severityLowBlue};
      stroke-width: 5px;
      cursor: ${props => props.cursor};
    }
    ${StyledText} {
      cursor: ${props => props.cursor};
    }
  }
`;

const ProcessNode = ({
  color,
  comment,
  cursor,
  id,
  isSelected = false,
  name,
  radius,
  forwardedRef,
  x,
  y,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onMouseUp,
}) => {
  return (
    <StyledG
      data-testid="process-node-group"
      id={id}
      name={name}
      cursor={cursor}
      isSelected={isSelected}
      ref={forwardedRef}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
    >
      <StyledCircle
        data-testid="process-node-circle"
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
  forwardedRef: PropTypes.ref,
  id: PropTypes.id.isRequired,
  isSelected: PropTypes.bool,
  name: PropTypes.string,
  radius: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseUp: PropTypes.func,
};

export default ProcessNode;

// vim: set ts=2 sw=2 tw=80:
