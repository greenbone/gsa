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

import glamorous, {Div} from 'glamorous';

import {Line as VxLine} from '@vx/shape';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';

import ToolTip from './tooltip';
import Theme from '../../utils/theme';

const DEFAULT_SHAPE_SIZE = 15;

const StyledLegend = glamorous.div({
  padding: '5px 10px',
  margin: '10px 5px',
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
  backgroundColor: Theme.mediumGray,
  color: Theme.white,
  opacity: 0.75,
});

export const Item = glamorous.div('legend-item', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: '5px 0',
},
({onClick}) => is_defined(onClick) ? {
  cursor: 'pointer',
} : undefined);

export const Label = glamorous.div('legend-label', {
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  flexGrow: 1,
  marginLeft: 10,
});

export const Rect = glamorous.div('legend-rect', {
  display: 'flex',
  alignItems: 'center',
  width: DEFAULT_SHAPE_SIZE,
  height: 10,
}, ({color}) => ({
  backgroundColor: color,
}));

export const Line = ({
  width = DEFAULT_SHAPE_SIZE + 5,
  height = DEFAULT_SHAPE_SIZE,
  color,
  lineWidth = 1,
  dashArray,
}) => {
  const y = height / 2;
  return (
    <Div
      height={height}
      backgroundColor={Theme.white}
      padding="0 2px"
     >
      <svg width={width} height={height}>
        <VxLine
          from={{x: 0, y}}
          to={{x: width, y}}
          strokeDasharray={dashArray}
          stroke={color}
          strokeWidth={lineWidth}
        />
      </svg>
    </Div>
  );
};

Line.propTypes = {
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.toString,
  height: PropTypes.number,
  lineWidth: PropTypes.number,
  width: PropTypes.number,
};

const Legend = ({
  data,
  children,
  innerRef,
}) => (
  <StyledLegend innerRef={innerRef}>
    {data.map((d, i) => (
      <ToolTip
        key={i}
        content={d.toolTip}
      >
        {({targetRef, hide, show}) =>
          is_defined(children) ?
            children({
              d,
              toolTipProps: {
                innerRef: targetRef,
                onMouseEnter: show,
                onMouseLeave: hide,
              },
            }) :
            <Item
              innerRef={targetRef}
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              <Rect color={d.color}/>
              <Label>{d.label}</Label>
            </Item>
        }
      </ToolTip>
    ))}
  </StyledLegend>
);

Legend.propTypes = {
  children: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.toString,
    label: PropTypes.any,
    toolTip: PropTypes.elementOrString,
  })).isRequired,
  innerRef: PropTypes.func,
};

export default Legend;

// vim: set ts=2 sw=2 tw=80:
