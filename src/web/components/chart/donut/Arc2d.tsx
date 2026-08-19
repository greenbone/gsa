/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {arc as d3arc} from 'd3-shape';
import {select} from 'd3-selection';
import 'd3-transition';
import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import ToolTip from 'web/components/chart/base/ToolTip';
import {type Path} from 'web/components/chart/utils/Path';
import Theme from 'web/utils/theme';

interface Arc2dData extends LegendData {
  value: number;
}

interface Arc2dProps<TData extends Arc2dData> {
  data: TData;
  path: Path;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  x: number;
  y: number;
  onDataClick?: (data: TData) => void;
  onHover?: (data: TData | undefined) => void;
}

const Arc2d = <TData extends Arc2dData = Arc2dData>({
  data,
  path,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  x,
  y,
  onDataClick,
  onHover,
}: Arc2dProps<TData>) => {
  const {color = Theme.lightGray, toolTip} = data;
  const arcRef = React.useRef<SVGPathElement | null>(null);
  const hasD3Geometry =
    isDefined(innerRadius) &&
    isDefined(outerRadius) &&
    isDefined(startAngle) &&
    isDefined(endAngle);
  const renderArc = (radius: number) =>
    d3arc()
      .innerRadius(innerRadius ?? 0)
      .outerRadius(radius)
      .padAngle(0.03)
      .cornerRadius(4)({startAngle, endAngle});
  const transitionArc = (radius: number) => {
    if (!hasD3Geometry || !arcRef.current) {
      return;
    }
    select(arcRef.current)
      .transition()
      .duration(200)
      .attr('d', renderArc(radius));
  };

  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <Group
          data-testid="arc-2d"
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
          onMouseEnter={() => {
            show();
            onHover?.(data);
            transitionArc((outerRadius as number) * 1.04);
          }}
          onMouseLeave={() => {
            hide();
            onHover?.(undefined);
            transitionArc(outerRadius as number);
          }}
        >
          <path
            ref={arcRef}
            d={String(hasD3Geometry ? renderArc(outerRadius as number) : path)}
            fill={String(color)}
          />
          <circle // used as positioning ref for tooltips
            ref={targetRef as React.Ref<SVGCircleElement>}
            cx={x}
            cy={y}
            r="1"
            visibility="hidden"
          />
        </Group>
      )}
    </ToolTip>
  );
};

export default Arc2d;
