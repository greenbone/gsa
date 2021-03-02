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

import {color as d3color} from 'd3-color';

import {isDefined} from 'gmp/utils/identity';

import Group from 'web/components/chart/group';
import ToolTip from 'web/components/chart/tooltip';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

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
