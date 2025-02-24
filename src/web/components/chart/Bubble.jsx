/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {pack, hierarchy} from 'd3-hierarchy';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Group from 'web/components/chart/Group';
import Svg from 'web/components/chart/Svg';
import ToolTip from 'web/components/chart/Tooltip';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

const BubbleChart = ({data = [], width, height, svgRef, onDataClick}) => {
  const maxWidth = width - margin.left - margin.right;
  const maxHeight = height - margin.top - margin.bottom;

  const hasBubbles = data.length > 0;

  const bubbles = pack().size([maxWidth, maxHeight]).padding(1.5);

  const root = hierarchy({children: data}).sum(d => d.value);

  const nodes = bubbles(root).leaves();
  return (
    <Svg ref={svgRef} height={height} width={width}>
      <Group left={margin.left} top={margin.top}>
        {hasBubbles ? (
          nodes.map((node, i) => {
            const {data: d, x, y, r} = node;
            return (
              <ToolTip key={i} content={d.toolTip}>
                {({targetRef, hide, show}) => {
                  const clippathId = 'clippath-' + i;
                  return (
                    <Group
                      left={x}
                      top={y}
                      onClick={
                        isDefined(onDataClick)
                          ? () => onDataClick(d)
                          : undefined
                      }
                      onMouseEnter={show}
                      onMouseLeave={hide}
                    >
                      <circle fill={d.color} r={r} />

                      <clipPath id={clippathId}>
                        {/* cut of text overflowing the circle */}
                        <circle r={r} />
                      </clipPath>

                      <text
                        ref={targetRef}
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
          })
        ) : (
          <circle
            cx={maxWidth / 2}
            cy={maxHeight / 2}
            fill={Theme.lightGray}
            r={maxHeight / 2}
          />
        )}
      </Group>
    </Svg>
  );
};

BubbleChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      color: PropTypes.toString.isRequired,
      label: PropTypes.toString.isRequired,
      toolTip: PropTypes.elementOrString,
    }),
  ),
  height: PropTypes.number.isRequired,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default BubbleChart;
