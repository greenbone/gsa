/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {color as d3color} from 'd3-color';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {
  PieOuterPath,
  PieTopPath,
  PieInnerPath,
} from 'web/components/chart/donut/Paths';
import {ArcDataPropType} from 'web/components/chart/donut/PropTypes';
import Group from 'web/components/chart/Group';
import ToolTip from 'web/components/chart/Tooltip';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const Arc3d = ({
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
}) => {
  const {color = Theme.lightGray, toolTip} = data;
  const darker = d3color(color).darker();
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
            ref={targetRef}
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

Arc3d.propTypes = {
  data: ArcDataPropType,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number.isRequired,
  innerRadiusX: PropTypes.number.isRequired,
  innerRadiusY: PropTypes.number.isRequired,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  path: PropTypes.toString.isRequired,
  startAngle: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default Arc3d;
