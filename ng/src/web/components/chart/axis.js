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

import {css} from 'glamor';

import {Axis as VxAxis} from '@vx/axis';

import PropTypes from '../../utils/proptypes';

const FONT_SIZE = 10;

const DEFAULT_TICK_LENGTH = 8;

const lineCss = css({
  shapeRendering: 'crispEdges',
  strokeWidth: 0.99,
  '& line': {
    shapeRendering: 'crispEdges',
    strokeWidth: 0.99,
  },
});

const DEFAULT_TICK_PROPS = {
  fill: 'black',
  fontFamily: 'Arial',
  fontSize: FONT_SIZE,
};

const left = () => ({
  dx: -0.25 * FONT_SIZE,
  dy: 0.25 * FONT_SIZE,
  textAnchor: 'end',
  ...DEFAULT_TICK_PROPS,
});

const right = () => ({
  dy: 0.25 * FONT_SIZE,
  dx: 0.25 * FONT_SIZE,
  textAnchor: 'start',
  ...DEFAULT_TICK_PROPS,
});

const top = () => ({
  dy: -0.25 * FONT_SIZE,
  textAnchor: 'middle',
  ...DEFAULT_TICK_PROPS,
});

const bottom = () => ({
  dy: 0.25 * FONT_SIZE,
  textAnchor: 'middle',
  ...DEFAULT_TICK_PROPS,
});

const TICK_LABEL_PROPS_FUNC = {
  left,
  right,
  top,
  bottom,
};

const Axis = ({
  orientation = 'bottom',
  labelOffset = orientation === 'bottom' || orientation === 'top' ? 8 : 36,
  tickLabelProps = TICK_LABEL_PROPS_FUNC[orientation],
  tickLength = DEFAULT_TICK_LENGTH,
  rangePadding = orientation === 'bottom' || orientation === 'top' ?
    tickLength : -tickLength,
  ...props
}) => (
  <VxAxis
    {...props}
    axisLineClassName={`${lineCss}`}
    tickClassName={`${lineCss}`}
    labelOffset={labelOffset}
    orientation={orientation}
    rangePadding={rangePadding}
    tickLabelProps={tickLabelProps}
    tickLength={tickLength}
    tickComponent={({formattedValue, ...tickProps}) => (
      <text {...tickProps}>{formattedValue}</text>
    )}
  />
);

Axis.propTypes = {
  labelOffset: PropTypes.number,
  orientation: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),
  rangePadding: PropTypes.number,
  tickLabelProps: PropTypes.func,
  tickLength: PropTypes.number,
};

export default Axis;

// vim: set ts=2 sw=2 tw=80:
