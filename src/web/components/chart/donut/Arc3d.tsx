/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {color as d3color, type HSLColor, type RGBColor} from 'd3-color';
import {isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import ToolTip from 'web/components/chart/base/Tooltip';
import {
  PieOuterPath,
  PieTopPath,
  PieInnerPath,
} from 'web/components/chart/donut/Paths';
import Theme from 'web/utils/Theme';

interface Arc3dData extends LegendData {
  value: number;
}

interface Arc3dProps<TData extends Arc3dData> {
  data: TData;
  innerRadiusX: number;
  innerRadiusY: number;
  outerRadiusX: number;
  outerRadiusY: number;
  donutHeight: number;
  path: string;
  startAngle: number;
  endAngle: number;
  x: number;
  y: number;
  onDataClick?: (data: TData) => void;
}

const Arc3d = <TData extends Arc3dData = Arc3dData>({
  data,
  innerRadiusX,
  innerRadiusY,
  outerRadiusX,
  outerRadiusY,
  donutHeight,
  path,
  startAngle,
  endAngle,
  x,
  y,
  onDataClick,
}: Arc3dProps<TData>) => {
  const {color = Theme.lightGray, toolTip} = data;
  let d3Color = d3color(String(color));
  if (!d3Color) {
    d3Color = d3color(Theme.lightGray);
  }
  const darker = (d3Color as HSLColor | RGBColor).darker();
  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <Group
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <PieInnerPath
            color={darker}
            donutHeight={donutHeight}
            endAngle={endAngle}
            innerRadiusX={innerRadiusX}
            innerRadiusY={innerRadiusY}
            startAngle={startAngle}
          />
          <PieTopPath color={color} path={path} />
          <PieOuterPath
            color={darker}
            donutHeight={donutHeight}
            endAngle={endAngle}
            outerRadiusX={outerRadiusX}
            outerRadiusY={outerRadiusY}
            startAngle={startAngle}
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

export default Arc3d;
