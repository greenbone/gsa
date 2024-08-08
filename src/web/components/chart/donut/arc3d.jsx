/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {color as d3color} from 'd3-color';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Group from '../group';
import ToolTip from '../tooltip';

import {PieOuterPath, PieTopPath, PieInnerPath} from './paths';
import {ArcDataPropType} from './proptypes';

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
          onMouseEnter={show}
          onMouseLeave={hide}
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
        >
          <PieInnerPath
            startAngle={startAngle}
            endAngle={endAngle}
            color={darker}
            donutHeight={donutHeight}
            innerRadiusX={innerRadiusX}
            innerRadiusY={innerRadiusY}
          />
          <PieTopPath color={color} path={path} />
          <PieOuterPath
            startAngle={startAngle}
            endAngle={endAngle}
            color={darker}
            donutHeight={donutHeight}
            outerRadiusX={outerRadiusX}
            outerRadiusY={outerRadiusY}
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

// vim: set ts=2 sw=2 tw=80:
