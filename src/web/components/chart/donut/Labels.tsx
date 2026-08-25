/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useMemo, type ReactNode} from 'react';
import {arc as d3arc, type PieArcDatum} from 'd3-shape';
import Group from 'web/components/chart/base/Group';
import Label from 'web/components/chart/base/Label';
import ToolTip from 'web/components/chart/base/ToolTip';
import Theme from 'web/utils/theme';

interface LabelData {
  value: number;
  toolTip?: ReactNode;
}

interface LabelsProps<TData extends LabelData> {
  arcs: PieArcDatum<TData>[];
  centerX: number;
  centerY: number;
  innerRadiusX?: number;
  outerRadiusX: number;
  innerRadiusY?: number;
  outerRadiusY?: number;
}

interface LabelPosition {
  isRightSide: boolean;
  y: number;
}

const LABEL_RADIUS_OFFSET = 10;
const LABEL_EDGE_OFFSET = 15;
const LABEL_GAP = 16;

const resolveLabelPositions = <TData extends LabelData>(
  arcs: PieArcDatum<TData>[],
  outerRadius: number,
): LabelPosition[] => {
  const outerArc = d3arc<unknown, PieArcDatum<TData>>()
    .innerRadius(outerRadius + LABEL_RADIUS_OFFSET)
    .outerRadius(outerRadius + LABEL_RADIUS_OFFSET);
  const positions = arcs.map(currentArc => ({
    isRightSide: (currentArc.startAngle + currentArc.endAngle) / 2 < Math.PI,
    y: outerArc.centroid(currentArc)[1],
  }));

  [true, false].forEach(isRightSide => {
    const sidePositions = positions
      .map((position, index) => ({position, index}))
      .filter(({position}) => position.isRightSide === isRightSide)
      .sort((a, b) => a.position.y - b.position.y);

    sidePositions.forEach((entry, index) => {
      if (index === 0) {
        return;
      }
      const previous = sidePositions[index - 1].position;
      entry.position.y = Math.max(entry.position.y, previous.y + LABEL_GAP);
    });
  });

  return positions;
};

const Labels = <TData extends LabelData = LabelData>({
  arcs,
  centerX,
  centerY,
  innerRadiusX,
  outerRadiusX,
  innerRadiusY,
  outerRadiusY,
}: LabelsProps<TData>) => {
  const labelPositions = useMemo(
    () => resolveLabelPositions(arcs, outerRadiusX),
    [arcs, outerRadiusX],
  );

  return (
    <Group left={centerX} top={centerY}>
      {arcs.map((currentArc, index) => {
        const arcData = currentArc.data;
        const arc = d3arc<unknown, PieArcDatum<TData>>()
          .innerRadius(innerRadiusX ?? 0)
          .outerRadius(outerRadiusX);
        const outerArc = d3arc<unknown, PieArcDatum<TData>>()
          .innerRadius(outerRadiusX + LABEL_RADIUS_OFFSET)
          .outerRadius(outerRadiusX + LABEL_RADIUS_OFFSET);
        const arcPoint = arc.centroid(currentArc);
        const outerArcPoint = outerArc.centroid(currentArc);
        const {isRightSide, y} = labelPositions[index];
        const labelX = outerRadiusX + LABEL_EDGE_OFFSET;
        const labelPoint = [isRightSide ? labelX : -labelX, y];
        const points = [arcPoint, outerArcPoint, labelPoint]
          .map(point => point.join(','))
          .join(' ');
        return (
          <ToolTip
            key={`${currentArc.startAngle}-${currentArc.endAngle}`}
            content={arcData.toolTip}
          >
            {({targetRef, hide, show}) => (
              <g>
                <polyline
                  fill="none"
                  points={points}
                  stroke="#BFBFBF"
                  strokeWidth="1px"
                />
                <Label
                  ref={targetRef as React.Ref<SVGElement>}
                  fill={Theme.darkGray}
                  fontFamily="Verdana, sans-serif"
                  fontSize="11px"
                  fontWeight="bold"
                  textAnchor={isRightSide ? 'start' : 'end'}
                  transform={`translate(${labelPoint.join(',')})`}
                  onMouseEnter={show}
                  onMouseLeave={hide}
                >
                  {arcData.value}
                </Label>
              </g>
            )}
          </ToolTip>
        );
      })}
    </Group>
  );
};

export default Labels;
