/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {pack, hierarchy} from 'd3-hierarchy';
import {isDefined} from 'gmp/utils/identity';
import ChartWithEmptyState from 'web/components/chart/base/ChartWithEmptyState';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';
import ToolTip from 'web/components/chart/base/ToolTip';

interface BubbleChartData extends LegendData {
  value: number;
}

interface BubbleChartProps {
  data?: BubbleChartData[];
  width: number;
  height: number;
  svgRef?: React.Ref<SVGSVGElement>;
  onDataClick?: (data: BubbleChartData) => void;
}

interface BubbleChartHierarchyData extends BubbleChartData {
  children: BubbleChartData[];
}

const HOVER_TRANSITION = 'opacity 180ms ease-in-out';

const margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
} as const;

const BubbleChart = ({
  data = [],
  width,
  height,
  svgRef,
  onDataClick,
}: BubbleChartProps) => {
  const [hoveredLabel, setHoveredLabel] = useState<string>();
  const maxWidth = width - margin.left - margin.right;
  const maxHeight = height - margin.top - margin.bottom;

  const hasBubbles = data.length > 0;

  const bubbles = pack<BubbleChartHierarchyData>()
    .size([maxWidth, maxHeight])
    .padding(1.5);

  const root = hierarchy<BubbleChartHierarchyData>({
    children: data,
    // dummy root node
    color: '',
    label: '',
    value: 0,
  }).sum(d => d.value);

  const nodes = bubbles(root).leaves();
  const orderedNodes = nodes
    .map((node, index) => ({node, index}))
    .sort(({node: firstNode}, {node: secondNode}) => {
      if (firstNode.data.label === hoveredLabel) {
        return 1;
      }
      if (secondNode.data.label === hoveredLabel) {
        return -1;
      }
      return 0;
    });
  return (
    <Svg ref={svgRef} height={height} width={width}>
      <Group
        data-testid="bubble-chart-content"
        left={margin.left}
        top={margin.top}
      >
        <ChartWithEmptyState
          data-testid="bubble-chart-empty"
          height={maxHeight}
          isEmpty={!hasBubbles}
          width={maxWidth}
        >
          {orderedNodes.map(({node, index}) => {
            const {data: d, x, y, r} = node;
            return (
              <ToolTip
                key={d.label}
                content={hoveredLabel === d.label ? d.toolTip : undefined}
              >
                {({targetRef, hide, show}) => {
                  const clippathId = 'clippath-' + index;
                  return (
                    <Group
                      data-testid={`bubble-chart-bubble-${index}`}
                      left={x}
                      top={y}
                      onClick={
                        isDefined(onDataClick)
                          ? () => onDataClick(d)
                          : undefined
                      }
                      onMouseEnter={() => {
                        show();
                        setHoveredLabel(d.label);
                      }}
                      onMouseLeave={() => {
                        hide();
                        setHoveredLabel(undefined);
                      }}
                    >
                      <circle
                        fill={String(d.color)}
                        opacity={
                          hoveredLabel !== undefined && hoveredLabel !== d.label
                            ? 0.35
                            : 1
                        }
                        r={r}
                        style={{transition: HOVER_TRANSITION}}
                      />

                      <clipPath id={clippathId}>
                        {/* cut of text overflowing the circle */}
                        <circle r={r} />
                      </clipPath>

                      <text
                        ref={targetRef as React.Ref<SVGTextElement>}
                        clipPath={`url(#${clippathId})`}
                        dominantBaseline="middle"
                        fontSize="10px"
                        fontWeight="normal"
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                    </Group>
                  );
                }}
              </ToolTip>
            );
          })}
        </ChartWithEmptyState>
      </Group>
    </Svg>
  );
};

export default BubbleChart;
