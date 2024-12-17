/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Axis as VxAxis} from '@visx/axis';
import React from 'react';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const FONT_SIZE = 10;

const DEFAULT_TICK_LENGTH = 8;

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
    axisLineClassName="axis-line"
    labelClassName="axis-label"
    labelOffset={labelOffset}
    orientation={orientation}
    rangePadding={rangePadding}
    tickClassName="axis-tick"
    tickComponent={({formattedValue, ...tickProps}) =>
      hideTickLabels ? null : <text {...tickProps}>{formattedValue}</text>
    }
    tickLabelProps={tickLabelProps}
    tickLength={tickLength}
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
