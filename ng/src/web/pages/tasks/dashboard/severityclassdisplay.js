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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {is_empty} from 'gmp/utils/string';

import {parse_float} from 'gmp/parser';

import {
  NA_VALUE,
  resultSeverityRiskFactor,
  translateRiskFactor,
} from '../../../utils/severity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../../components/chart/donut3d';

import DataDisplay from '../../../components/dashboard2/data/display';

import {TASKS_SEVERITY} from './loaders';

import {EMPTY, totalCount, percent, riskFactorColorScale} from './common';

const transformSeverityData = (data = {}, {severityClass}) => {
  const {group: groups} = data;

  if (!is_defined(groups)) {
    return EMPTY;
  };

  const sum = totalCount(groups);

  const tdata = map(groups, group => {
    const {count} = group;

    let {value} = group;
    if (is_empty(value)) {
      value = NA_VALUE;
    }
    else {
      value = parse_float(value);
    }

    const perc = percent(count, sum);
    const riskFactor = resultSeverityRiskFactor(value, severityClass);
    const label = translateRiskFactor(riskFactor);

    // TODO add severity class ranges (e.g. 9.1 - 10 High) to label
    return {
      value: count,
      label,
      toolTip: `${label}: ${perc}% (${count})`,
      color: riskFactorColorScale(riskFactor),
    };
  });

  tdata.total = sum;

  return tdata;
};

const TasksSeverityDisplay = ({
  severityClass,
  ...props
}) => (
  <DataDisplay
    {...props}
    severityClass={severityClass}
    dataTransform={transformSeverityData}
    dataId={TASKS_SEVERITY}
    title={({data}) =>
      _('Tasks by Severity Class (Total: {{count}})',
        {count: data.total})}
  >
    {({width, height, data}) => (
      <DonutChart
        width={width}
        height={height}
        data={data}
      />
    )}
  </DataDisplay>
);

TasksSeverityDisplay.propTypes = {
  severityClass: PropTypes.severityClass,
};

export default TasksSeverityDisplay;

// vim: set ts=2 sw=2 tw=80:
