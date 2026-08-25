/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef} from 'react';
import {
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  type AxisScale,
} from 'd3-axis';
import {format as d3format} from 'd3-format';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3-scale';
import {select} from 'd3-selection';
import {isDefined} from 'gmp/utils/identity';
import Theme from 'web/utils/theme';

type AxisDomainValue = string | number | Date;

type SupportedScale =
  | ScaleBand<string>
  | ScaleBand<number>
  | ScaleLinear<number, number>
  | ScaleTime<number, number>;

interface AxisProps {
  dataTestId?: string;
  // Whether to hide the axis line (domain). Defaults to false.
  hideDomain?: boolean;
  // Whether to hide the tick labels. Defaults to false.
  hideTickLabels?: boolean;
  label?: string;
  // offset of the axis label from the axis line, in pixels. Defaults to 25 for horizontal axes and 36 for vertical axes.
  labelOffset?: number;
  left?: number;
  orientation?: 'bottom' | 'top' | 'left' | 'right';
  // number of ticks to display on the axis. If not provided, the axis will automatically determine the number of ticks based on the scale and available space.
  numTicks?: number;
  scale: SupportedScale;
  // padding between the axis line ticks and the tick labels, in pixels. Defaults to 10.
  rangePadding?: number;
  // rotation of the tick labels, in degrees. Defaults to 0 (no rotation).
  tickLabelRotation?: number;
  // function to format the tick labels. If not provided, the axis will use a default formatting based on the scale type.
  tickFormat?: (value: AxisDomainValue) => string;
  // array of values to use for the axis ticks. If not provided, the axis will automatically generate tick values based on the scale and numTicks.
  // If provided, the axis will only display ticks for the specified values.
  // Overrides numTicks and tickFormat if provided.
  tickValues?: AxisDomainValue[];
  // length of the axis ticks, in pixels. Defaults to 8.
  tickLength?: number;
  top?: number;
}

const FONT_SIZE = 10;

const DEFAULT_TICK_LENGTH = 8;

const standardFormat = d3format('.2~s');

const AXIS_GENERATORS = {
  bottom: axisBottom,
  top: axisTop,
  left: axisLeft,
  right: axisRight,
} as const;

const isTimeScale = (
  scale: SupportedScale,
): scale is ScaleTime<number, number> =>
  'invert' in scale && scale.invert(0) instanceof Date;

const Axis = ({
  dataTestId,
  hideDomain = false,
  hideTickLabels = false,
  orientation = 'bottom',
  labelOffset = orientation === 'bottom' || orientation === 'top' ? 15 : 36,
  tickLength = DEFAULT_TICK_LENGTH,
  label,
  left = 0,
  top = 0,
  numTicks,
  scale,
  rangePadding,
  tickLabelRotation = 0,
  tickFormat,
  tickValues,
}: AxisProps) => {
  const axisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!axisRef.current) return;

    const generator = AXIS_GENERATORS[orientation](
      scale as AxisScale<AxisDomainValue>,
    );
    generator.tickSize(tickLength);

    if (isDefined(numTicks)) {
      generator.ticks(numTicks);
    }

    if (isDefined(rangePadding)) {
      // Keep compatibility with the old visx prop using the nearest d3-axis equivalent.
      generator.tickPadding(rangePadding);
    }

    if (tickFormat) {
      generator.tickFormat(value => tickFormat(value));
    } else if (!isTimeScale(scale)) {
      generator.tickFormat(value =>
        typeof value === 'number' ? standardFormat(value) : String(value),
      );
    }

    if (tickValues) {
      generator.tickValues(tickValues);
    }

    const sel = select(axisRef.current);
    sel.call(generator);

    // Apply tick label styling
    sel
      .selectAll('.tick text')
      .attr('fill', Theme.mediumGray)
      .attr('font-family', Theme.Font.default)
      .attr('font-size', FONT_SIZE);

    if (tickLabelRotation !== 0) {
      sel
        .selectAll('.tick text')
        .attr('text-anchor', tickLabelRotation < 0 ? 'end' : 'start')
        .attr('transform', `rotate(${tickLabelRotation})`)
        .attr('dx', tickLabelRotation < 0 ? '-0.5em' : '0.5em')
        .attr('dy', '0.5em');
    }

    if (hideTickLabels) {
      sel.selectAll('.tick text').remove();
    }

    // Add class names for external styling
    sel.select('.domain').classed('axis-line', true);
    if (hideDomain) {
      sel.select('.domain').remove();
    }
    sel.selectAll('.tick').classed('axis-tick', true);
  }, [
    scale,
    hideDomain,
    orientation,
    numTicks,
    rangePadding,
    tickLabelRotation,
    tickFormat,
    tickValues,
    tickLength,
    hideTickLabels,
  ]);

  const range = scale.range();
  const rangeCenter = (range[0] + range[1]) / 2;
  const isHorizontal = orientation === 'bottom' || orientation === 'top';

  let labelTransform: string | undefined;
  let labelX: number | undefined;
  let labelY: number | undefined;

  if (label) {
    if (isHorizontal) {
      labelX = rangeCenter;
      labelY =
        orientation === 'bottom'
          ? tickLength + FONT_SIZE + labelOffset
          : -(tickLength + labelOffset);
    } else {
      const offset =
        orientation === 'left'
          ? -(tickLength + labelOffset)
          : tickLength + labelOffset;
      const rotation = orientation === 'left' ? -90 : 90;
      labelTransform = `translate(${offset}, ${rangeCenter}) rotate(${rotation})`;
    }
  }

  return (
    <g data-testid={dataTestId} transform={`translate(${left}, ${top})`}>
      <g ref={axisRef} />
      {label && (
        <text
          className="axis-label"
          fill={Theme.darkGray}
          fontSize={FONT_SIZE}
          textAnchor="middle"
          transform={labelTransform}
          x={labelX}
          y={labelY}
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default Axis;
