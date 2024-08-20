/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Label from '../label';
import ToolTip from '../tooltip';

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
