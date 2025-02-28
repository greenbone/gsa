/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Pie from 'web/components/chart/donut/Pie';
import {DataPropType} from 'web/components/chart/donut/PropTypes';
import Label from 'web/components/chart/Label';
import ToolTip from 'web/components/chart/Tooltip';
import PropTypes from 'web/utils/PropTypes';

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
    innerRadiusX={innerRadiusX}
    innerRadiusY={innerRadiusY}
    left={centerX}
    outerRadiusX={outerRadiusX}
    outerRadiusY={outerRadiusY}
    pieValue={d => d.value}
    top={centerY}
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
              key={index}
              ref={targetRef}
              x={x}
              y={y}
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
