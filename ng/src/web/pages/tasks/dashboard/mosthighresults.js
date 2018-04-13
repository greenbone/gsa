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

import {withRouter} from 'react-router';

import {format as d3format} from 'd3-format';

import _ from 'gmp/locale';

import {parse_float, parse_severity} from 'gmp/parser';

import {resultSeverityRiskFactor} from '../../../utils/severity';
import PropTypes from '../../../utils/proptypes';


import BarChart from '../../../components/chart/bar';

import DataDisplay from '../../../components/dashboard2/display/datadisplay';
import {
  riskFactorColorScale,
} from '../../../components/dashboard2/display/utils';

import {TasksHighResultsLoader} from './loaders';

const format = d3format('0.2f');

const transformHighResultsData = (data = {}, {severityClass}) => {
  const {groups = []} = data;

  return groups
    .filter(group => {
      const {text = {}} = group;
      const {high_per_host = 0} = text;
      return parse_float(high_per_host) > 0;
    })
    .map(group => {
      const {text, value: id} = group;
      const {name} = text;
      const high_per_host = parse_float(text.high_per_host);
      const severity = parse_severity(text.severity);
      const riskFactor = resultSeverityRiskFactor(severity, severityClass);
      return {
        y: high_per_host,
        x: name,
        label: name,
        color: riskFactorColorScale(riskFactor),
        toolTip: `${name}: ${format(high_per_host)}`,
        id,
      };
    });
};

class TasksMostHighResultsDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {router} = this.props;

    router.push(`/ng/task/${data.id}`);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;
    return (
      <TasksHighResultsLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformHighResultsData}
            title={() => _('Tasks with most High Results per Host')}
          >
            {({width, height, data: tdata}) => (
              <BarChart
                horizontal
                displayLegend={false}
                width={width}
                height={height}
                data={tdata}
                xLabel={_('Results per Host')}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </TasksHighResultsLoader>
    );
  }
}

TasksMostHighResultsDisplay.propTypes = {
  filter: PropTypes.filter,
  router: PropTypes.object.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

export default withRouter(TasksMostHighResultsDisplay);

// vim: set ts=2 sw=2 tw=80:
