/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type AxisScale, Axis as VxAxis} from '@visx/axis';
import {type TextProps} from '@visx/text/lib/Text';
import Theme from 'web/utils/Theme';

interface AxisProps {
  hideTickLabels?: boolean;
  label?: string;
  labelOffset?: number;
  left?: number;
  orientation?: 'bottom' | 'top' | 'left' | 'right';
  numTicks?: number;
  rangePadding?: number;
  scale: AxisScale;
  tickFormat?: (value: number) => string;
  tickLabelProps?: () => Partial<TextProps>;
  tickValues?: number[];
  tickLength?: number;
  top?: number;
}

type TextAnchor = 'start' | 'middle' | 'end' | 'inherit';

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
  textAnchor: 'end' as TextAnchor,
  ...DEFAULT_TICK_PROPS,
});

const right = () => ({
  dy: 0.25 * FONT_SIZE,
  dx: 0.25 * FONT_SIZE,
  textAnchor: 'start' as TextAnchor,
  ...DEFAULT_TICK_PROPS,
});

const top = () => ({
  dy: -0.25 * FONT_SIZE,
  textAnchor: 'middle' as TextAnchor,
  ...DEFAULT_TICK_PROPS,
});

const bottom = () => ({
  dy: 0.25 * FONT_SIZE,
  textAnchor: 'middle' as TextAnchor,
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
}: AxisProps) => (
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

export default Axis;
