/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {Line as VxLine} from '@vx/shape';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import ToolTip from './tooltip';

const DEFAULT_SHAPE_SIZE = 15;

const StyledLegend = styled.div`
  padding: 5px 10px;
  margin: 10px 5px;
  display: flex;
  flex-direction: column;
  user-select: none;
  background-color: ${Theme.mediumGray};
  color: ${Theme.white};
  opacity: 0.75;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 5px 0;
  ${props =>
    isDefined(props.onClick)
      ? {
          cursor: 'pointer',
        }
      : undefined};
`;

export const Label = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  flex-grow: 1;
  margin-left: 10px;
`;

export const Rect = styled.div`
  display: flex;
  align-items: center;
  width: ${DEFAULT_SHAPE_SIZE}px;
  height: 10px;
  background-color: ${props => props.color};
`;

const StyledDiv = styled.div`
  height: ${props => props.height}px;
  background-color: ${Theme.white};
  padding: 0 2px;
`;

export const Line = ({
  width = DEFAULT_SHAPE_SIZE + 5,
  height = DEFAULT_SHAPE_SIZE,
  color,
  lineWidth = 1,
  dashArray,
}) => {
  const y = height / 2;
  return (
    <StyledDiv>
      <svg width={width} height={height}>
        <VxLine
          from={{x: 0, y}}
          to={{x: width, y}}
          strokeDasharray={dashArray}
          stroke={color}
          strokeWidth={lineWidth}
        />
      </svg>
    </StyledDiv>
  );
};

Line.propTypes = {
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.toString,
  height: PropTypes.number,
  lineWidth: PropTypes.number,
  width: PropTypes.number,
};

const Legend = React.forwardRef(({data, children, onItemClick}, ref) => (
  <StyledLegend ref={ref}>
    {data.map((d, i) => (
      <ToolTip key={i} content={d.toolTip}>
        {({targetRef, hide, show}) =>
          isDefined(children) ? (
            children({
              d,
              toolTipProps: {
                ref: targetRef,
                onMouseEnter: show,
                onMouseLeave: hide,
              },
              onItemClick,
            })
          ) : (
            <Item
              ref={targetRef}
              onMouseEnter={show}
              onMouseLeave={hide}
              onClick={
                isDefined(onItemClick) ? () => onItemClick(d) : undefined
              }
            >
              <Rect color={d.color} />
              <Label>{d.label}</Label>
            </Item>
          )
        }
      </ToolTip>
    ))}
  </StyledLegend>
));

Legend.propTypes = {
  children: PropTypes.func,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.toString,
      label: PropTypes.any,
      toolTip: PropTypes.elementOrString,
    }),
  ).isRequired,
  onItemClick: PropTypes.func,
};

export default Legend;

// vim: set ts=2 sw=2 tw=80:
