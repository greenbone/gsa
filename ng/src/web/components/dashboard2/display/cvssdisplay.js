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

import {is_empty} from 'gmp/utils/string';

import {parse_int, parse_float} from 'gmp/parser';

import {
  NA_VALUE,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  ERROR_VALUE,
  _NA,
  _LOG,
  _ERROR,
  _FALSE_POSITIVE,
  resultSeverityRiskFactor,
  translateRiskFactor,
} from '../../../utils/severity';
import PropTypes from '../../../utils/proptypes';

import BarChart from '../../chart/bar';

import DataDisplay from './datadisplay';

import {totalCount, percent, riskFactorColorScale} from './utils';

const getSeverityClassLabel = value => {
  switch (value) {
    case NA_VALUE:
      return _NA;
    case LOG_VALUE:
      return _LOG;
    case ERROR_VALUE:
      return _ERROR;
    case FALSE_POSITIVE_VALUE:
      return _FALSE_POSITIVE;
    default:
      return value;
  }
};

const transformCvssData = (data = {}, {severityClass}) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const cvssData = {
    [NA_VALUE]: 0,
    [LOG_VALUE]: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  };

  groups.forEach(group => {
    let {value, count = 0} = group;
    if (is_empty(value)) {
      value = NA_VALUE;
    }
    count = parse_int(count);

    cvssData[value] = count;
  });

  const tdata = Object.keys(cvssData)
    .sort((a, b) => {
      return a - b;
    })
    .map(key => {
      const count = cvssData[key];
      const perc = percent(count, sum);

      const value = Math.ceil(parse_float(key));

      const riskFactor = resultSeverityRiskFactor(value, severityClass);
      const label = translateRiskFactor(riskFactor);

      const toolTip = value > 0 ?
        `${value - 1}.1 - ${value}.0 (${label}): ${perc}% (${count})` :
        `${label}: ${perc}% (${count})`;
      return {
        x: getSeverityClassLabel(value),
        y: count,
        label,
        toolTip,
        color: riskFactorColorScale(riskFactor),
      };
    });

  tdata.total = sum;

  return tdata;
};

const CvssDisplay = ({
  title,
  ...props
}) => (
  <DataDisplay
    {...props}
    dataTransform={transformCvssData}
    title={title}
  >
    {({width, height, data}) => (
      <BarChart
        displayLegend={false}
        width={width}
        height={height}
        data={data}
      />
    )}
  </DataDisplay>
);

CvssDisplay.propTypes = {
  title: PropTypes.func.isRequired,
};

export default CvssDisplay;

// vim: set ts=2 sw=2 tw=80:
