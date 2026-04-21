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
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3-scale';
import {select} from 'd3-selection';
import Theme from 'web/utils/Theme';

type AxisDomainValue = string | number | Date;

type SupportedScale =
  | ScaleBand<string>
  | ScaleBand<number>
  | ScaleLinear<number, number>
  | ScaleTime<number, number>;

interface AxisProps {
  hideTickLabels?: boolean;
  label?: string;
  labelOffset?: number;
  left?: number;
  orientation?: 'bottom' | 'top' | 'left' | 'right';
  numTicks?: number;
  scale: SupportedScale;
  rangePadding?: number;
  tickFormat?: (value: AxisDomainValue) => string;
  tickValues?: AxisDomainValue[];
  tickLength?: number;
  top?: number;
}

const FONT_SIZE = 10;

const DEFAULT_TICK_LENGTH = 8;

const AXIS_GENERATORS = {
  bottom: axisBottom,
  top: axisTop,
  left: axisLeft,
  right: axisRight,
} as const;

const Axis = ({
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

    if (numTicks !== undefined) {
      generator.ticks(numTicks);
    }

    if (rangePadding !== undefined) {
      // Keep compatibility with the old visx prop using the nearest d3-axis equivalent.
      generator.tickPadding(rangePadding);
    }

    if (tickFormat) {
      generator.tickFormat(value => tickFormat(value));
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

    if (hideTickLabels) {
      sel.selectAll('.tick text').remove();
    }

    // Add class names for external styling
    sel.select('.domain').classed('axis-line', true);
    sel.selectAll('.tick').classed('axis-tick', true);
  }, [
    scale,
    orientation,
    numTicks,
    rangePadding,
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
    <g transform={`translate(${left}, ${top})`}>
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
