/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {arc as d3arc, pie as d3pie} from 'd3-shape';

import {Group} from '@vx/group';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';

const Pie = ({
  className,
  top = 0,
  left = 0,
  data,
  innerRadius = 0,
  outerRadius,
  cornerRadius,
  startAngle = 0,
  endAngle,
  padAngle,
  padRadius,
  pieSort,
  pieValue,
  children,
}) => {
  const path = d3arc();
  path.innerRadius(innerRadius);

  if (is_defined(outerRadius)) {
    path.outerRadius(outerRadius);
  }

  if (is_defined(cornerRadius)) {
    path.cornerRadius(cornerRadius);
  }

  if (is_defined(padRadius)) {
    path.padRadius(padRadius);
  }

  const pie = d3pie();

  if (is_defined(pieSort)) {
    pie.sort(pieSort);
  }

  if (is_defined(pieValue)) {
    pie.value(pieValue);
  }

  if (is_defined(padAngle)) {
    pie.padAngle(padAngle);
  }

  const arcs = pie(data);
  return (
    <Group
      className={className}
      top={top}
      left={left}
    >
      {arcs.map((arc, i) => {
        const [x, y] = path.centroid(arc);
        return children({
          index: i,
          x,
          y,
          path: path(arc),
          startAngle: arc.startAngle,
          endAngle: arc.endAngle,
          padAngle: arc.padAngle,
          data: arc.data,
        });
      })}
    </Group>
  );
};

Pie.propTypes = {
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  cornerRadius: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  endAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  left: PropTypes.number,
  outerRadius: PropTypes.number,
  padAngle: PropTypes.number,
  padRadius: PropTypes.number,
  pieSort: PropTypes.func,
  pieValue: PropTypes.func,
  startAngle: PropTypes.number,
  top: PropTypes.number,
};

export default Pie;

// vim: set ts=2 sw=2 tw=80:
