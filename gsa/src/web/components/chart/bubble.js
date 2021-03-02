/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {pack, hierarchy} from 'd3-hierarchy';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Group from './group';
import Svg from './svg';
import ToolTip from './tooltip';

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
    <Svg width={width} height={height} ref={svgRef}>
      <Group top={margin.top} left={margin.left}>
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
                      onMouseEnter={show}
                      onMouseLeave={hide}
                      onClick={
                        isDefined(onDataClick)
                          ? () => onDataClick(d)
                          : undefined
                      }
                    >
                      <circle fill={d.color} r={r} />

                      <clipPath id={clippathId}>
                        {/* cut of text overflowing the circle */}
                        <circle r={r} />
                      </clipPath>

                      <text
                        ref={targetRef}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontWeight="normal"
                        fontSize="10px"
                        clipPath={`url(#${clippathId})`}
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
            fill={Theme.lightGray}
            r={maxHeight / 2}
            cx={maxWidth / 2}
            cy={maxHeight / 2}
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

// vim: set ts=2 sw=2 tw=80:
