/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledG = styled.g`
  & line {
    stroke: ${props => (props.isSelected ? Theme.mediumBlue : Theme.darkGray)};
  }
  &:hover line {
    stroke: ${Theme.mediumBlue};
    cursor: pointer;
  }
`;

const calculateLine = ({source, target}) => {
  const middleX = (target.x + source.x) / 2;
  const middleY = (target.y + source.y) / 2;
  return (
    source.x +
    ',' +
    source.y +
    ' ' +
    middleX +
    ',' +
    middleY +
    ' ' +
    target.x +
    ',' +
    target.y
  );
};

const Edge = ({cursor, isSelected = false, source, target, onMouseDown}) => {
  return (
    <StyledG isSelected={isSelected} cursor={cursor} onMouseDown={onMouseDown}>
      <defs>
        <marker
          id="mid"
          orient="auto"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="2.5"
        >
          <path d="M 5,2.5 0,5 0,0 z" />
        </marker>
      </defs>
      <line
        data-testid="bpm-edge-line"
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        fill={Theme.darkGray}
        strokeWidth="4px"
      />
      {/* this line is used to increase the clickable area of the edge*/}
      <line
        data-testid="bpm-edge-clickline"
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        strokeOpacity={0}
        strokeWidth="25px"
      />
      {/* in order to be able to use midMarker this invisible polyline is
          rendered to position the arrow head. The polyline can not be hovered
          or selected, though, so for element selection the <line> is used */}
      <polyline
        data-testid="bpm-edge-polyline"
        points={calculateLine({source, target})}
        strokeWidth="4px"
        markerMid="url(#mid)"
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
