/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import Label from 'web/components/chart/base/Label';
import ToolTip from 'web/components/chart/base/Tooltip';
import Pie from 'web/components/chart/donut/Pie';

interface LabelData {
  value: number;
  toolTip?: ReactNode;
}

interface LabelsProps<TData extends LabelData> {
  data: TData[];
  centerX: number;
  centerY: number;
  innerRadiusX?: number;
  outerRadiusX: number;
  innerRadiusY?: number;
  outerRadiusY?: number;
}

const MIN_ANGLE_FOR_LABELS = 0.15;

const Labels = <TData extends LabelData = LabelData>({
  data,
  centerX,
  centerY,
  innerRadiusX,
  outerRadiusX,
  innerRadiusY,
  outerRadiusY,
}: LabelsProps<TData>) => (
  <Pie
    data={data}
    innerRadiusX={innerRadiusX}
    innerRadiusY={innerRadiusY}
    left={centerX}
    outerRadiusX={outerRadiusX}
    outerRadiusY={outerRadiusY}
    pieValue={d => d.value}
    top={centerY}
  >
    {({data: arcData, index, startAngle, endAngle, x, y}) => {
      const angleAbs = Math.abs(startAngle - endAngle);
      if (angleAbs < MIN_ANGLE_FOR_LABELS) {
        return null;
      }
      return (
        <ToolTip key={index} content={arcData.toolTip}>
          {({targetRef, hide, show}) => (
            <Label
              key={index}
              ref={targetRef as React.Ref<SVGElement>}
              x={x}
              y={y}
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              {arcData.value}
            </Label>
          )}
        </ToolTip>
      );
    }}
  </Pie>
);

export default Labels;
