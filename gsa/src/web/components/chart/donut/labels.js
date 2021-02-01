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

import Label from 'web/components/chart/label';
import ToolTip from 'web/components/chart/tooltip';

import PropTypes from 'web/utils/proptypes';

import Pie from './pie';
import {DataPropType} from './proptypes';

const MIN_ANGLE_FOR_LABELS = 0.15;

const Labels = ({
  data,
  centerX,
  centerY,
  innerRadiusX,
  outerRadiusX,
  innerRadiusY,
  outerRadiusY,
}) => (
  <Pie
    data={data}
    left={centerX}
    top={centerY}
    innerRadiusX={innerRadiusX}
    outerRadiusX={outerRadiusX}
    innerRadiusY={innerRadiusY}
    outerRadiusY={outerRadiusY}
    pieValue={d => d.value}
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
              x={x}
              y={y}
              ref={targetRef}
              key={index}
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

Labels.propTypes = {
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  data: DataPropType,
  innerRadiusX: PropTypes.number,
  innerRadiusY: PropTypes.number,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number,
};

export default Labels;

// vim: set ts=2 sw=2 tw=80:
