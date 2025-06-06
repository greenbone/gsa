/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {Line as VxLine} from '@visx/shape';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import ToolTip from 'web/components/chart/Tooltip';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const DEFAULT_SHAPE_SIZE = 15;

const StyledLegend = styled.div`
  padding: 5px 10px;
  margin: 10px 5px;
  display: flex;
  flex-direction: column;
  user-select: none;
  color: ${Theme.black};
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
      <svg height={height} width={width}>
        <VxLine
          from={{x: 0, y}}
          stroke={color}
          strokeDasharray={dashArray}
          strokeWidth={lineWidth}
          to={{x: width, y}}
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
              onClick={
                isDefined(onItemClick) ? () => onItemClick(d) : undefined
              }
              onMouseEnter={show}
              onMouseLeave={hide}
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
