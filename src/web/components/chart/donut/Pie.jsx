/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {pie as d3pie} from 'd3-shape';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Group from 'web/components/chart/Group';
import arc from 'web/components/chart/utils/Arc';
import PropTypes from 'web/utils/PropTypes';

const sortArcsByStartAngle = (a, b) => (a.startAngle > b.startAngle ? -1 : 1);

const Pie = ({
  className,
  top = 0,
  left = 0,
  data,
  innerRadiusX = 0,
  outerRadiusX,
  innerRadiusY,
  outerRadiusY,
  cornerRadius,
  startAngle = 0,
  endAngle,
  padAngle,
  padRadius,
  pieSort,
  pieValue,
  arcsSort = sortArcsByStartAngle,
  children,
}) => {
  const arcPath = arc();
  arcPath.outerRadiusX(outerRadiusX);

  if (isDefined(innerRadiusX)) {
    arcPath.innerRadiusX(innerRadiusX);
  }

  if (isDefined(innerRadiusY)) {
    arcPath.innerRadiusY(innerRadiusY);
  }

  if (isDefined(outerRadiusY)) {
    arcPath.outerRadiusY(outerRadiusY);
  }

  // if (is_defined(cornerRadius)) {
  //   path.cornerRadius(cornerRadius);
  // }

  // if (is_defined(padRadius)) {
  //   path.padRadius(padRadius);
  // }

  const pie = d3pie();

  // don't sort values. default is descending
  pie.sortValues(null);

  if (isDefined(pieSort)) {
    pie.sort(pieSort);
  }

  if (isDefined(pieValue)) {
    pie.value(pieValue);
  }

  if (isDefined(padAngle)) {
    pie.padAngle(padAngle);
  }

  const arcs = pie(data);

  arcs.sort(arcsSort);
  return (
    <Group className={className} left={left} top={top}>
      {arcs.map((currentArc, i) => {
        const {x, y} = arcPath.centroid(currentArc);
        return children({
          index: i,
          x,
          y,
          path: arcPath.path(currentArc),
          startAngle: currentArc.startAngle,
          endAngle: currentArc.endAngle,
          padAngle: currentArc.padAngle,
          data: currentArc.data,
        });
      })}
    </Group>
  );
};

Pie.propTypes = {
  arcsSort: PropTypes.func,
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  cornerRadius: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  endAngle: PropTypes.number,
  innerRadiusX: PropTypes.number,
  innerRadiusY: PropTypes.number,
  left: PropTypes.number,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number,
  padAngle: PropTypes.number,
  padRadius: PropTypes.number,
  pieSort: PropTypes.func,
  pieValue: PropTypes.func,
  startAngle: PropTypes.number,
  top: PropTypes.number,
};

export default Pie;
