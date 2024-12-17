/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {ArcDataPropType} from 'web/components/chart/donut/proptypes';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Group from '../group';
import ToolTip from '../tooltip';

const Arc2d = ({data, path, x, y, onDataClick}) => {
  const {color = Theme.lightGray, toolTip} = data;
  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <Group
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <path d={path} fill={color} />
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

Arc2d.propTypes = {
  data: ArcDataPropType.isRequired,
  path: PropTypes.toString.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
};

export default Arc2d;

// vim: set ts=2 sw=2 tw=80:
