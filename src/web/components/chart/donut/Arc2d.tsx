/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {arc as d3arc, type DefaultArcObject} from 'd3-shape';
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
  path?: Path;
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
  const hasD3Geometry =
    isDefined(innerRadius) &&
    isDefined(outerRadius) &&
    isDefined(startAngle) &&
    isDefined(endAngle);
  const renderArc = (radius: number, startAngle: number, endAngle: number) =>
    d3arc<unknown, DefaultArcObject>()
      .innerRadius(innerRadius ?? 0)
      .outerRadius(radius)
      .padAngle(0.03)
      .cornerRadius(4)({
      innerRadius: 0,
      outerRadius: radius,
      startAngle,
      endAngle,
    });
  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <Group
          data-testid="arc-2d"
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
          onMouseEnter={() => {
            show();
            onHover?.(data);
          }}
          onMouseLeave={() => {
            hide();
            onHover?.(undefined);
          }}
        >
          <path
            d={String(
              hasD3Geometry
                ? renderArc(outerRadius, startAngle, endAngle)
                : path,
            )}
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
