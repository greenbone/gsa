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

import {css} from 'glamor';

import {Axis as VxAxis} from '@vx/axis';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const FONT_SIZE = 10;

const DEFAULT_TICK_LENGTH = 8;

const labelCss = css({
  fill: Theme.darkGray,
});

const lineCss = css({
  shapeRendering: 'crispEdges',
  stroke: Theme.mediumGray,
  strokeWidth: 0.99,
});

const tickCss = css({
  '& line': {
    stroke: Theme.mediumGray,
    shapeRendering: 'crispEdges',
    strokeWidth: 0.99,
  },
});

const DEFAULT_TICK_PROPS = {
  fill: Theme.mediumGray,
  fontFamily: Theme.Font.default,
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
  hideTickLabels = false,
  orientation = 'bottom',
  labelOffset = orientation === 'bottom' || orientation === 'top' ? 8 : 36,
  tickLabelProps = TICK_LABEL_PROPS_FUNC[orientation],
  tickLength = DEFAULT_TICK_LENGTH,
  rangePadding = orientation === 'bottom' || orientation === 'top'
    ? tickLength
    : -tickLength,
  ...props
}) => (
  <VxAxis
    {...props}
    axisLineClassName={`${lineCss}`}
    tickClassName={`${tickCss}`}
    labelOffset={labelOffset}
    labelClassName={`${labelCss}`}
    orientation={orientation}
    rangePadding={rangePadding}
    tickLabelProps={tickLabelProps}
    tickLength={tickLength}
    tickComponent={({formattedValue, ...tickProps}) =>
      hideTickLabels ? null : <text {...tickProps}>{formattedValue}</text>
    }
  />
);

Axis.propTypes = {
  hideTickLabels: PropTypes.bool,
  labelOffset: PropTypes.number,
  orientation: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),
  rangePadding: PropTypes.number,
  tickLabelProps: PropTypes.func,
  tickLength: PropTypes.number,
};

export default Axis;

// vim: set ts=2 sw=2 tw=80:
