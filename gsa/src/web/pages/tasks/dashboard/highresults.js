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

import {is_defined} from 'gmp/utils/identity';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import {severityFormat} from 'web/utils/render';
import {resultSeverityRiskFactor, _NA} from 'web/utils/severity';

import BubbleChart from 'web/components/chart/bubble';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  riskFactorColorScale,
} from 'web/components/dashboard/display/utils';

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
      const displaySeverity = is_defined(severity) ?
        severityFormat(severity) : _NA;
      const displayHighHost = format(high_per_host);
      return {
        value: high_per_host,
        label: name,
        severity: displaySeverity,
        color: riskFactorColorScale(riskFactor),
        toolTip: `${name}: ${displayHighHost} (Severity ${displaySeverity})`,
        id,
      };
    });
};

export class TasksHighResultsDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {router} = this.props;

    router.push(`/task/${data.id}`);
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
            filter={filter}
            dataTransform={transformHighResultsData}
            title={() => _('Tasks by High Results per Host')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BubbleChart
                width={width}
                height={height}
                data={tdata}
                svgRef={svgRef}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </TasksHighResultsLoader>
    );
  }
}

TasksHighResultsDisplay.propTypes = {
  filter: PropTypes.filter,
  router: PropTypes.object.isRequired,
};

TasksHighResultsDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: TASKS_FILTER_FILTER,
  })
)(TasksHighResultsDisplay);

TasksHighResultsDisplay.displayId = 'task-by-high-results';

export const TasksHighResultsTableDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_('Task Name'), _('High per Host'), _('Severity')],
  dataRow: row => [row.label, row.value, row.severity],
  dataTransform: transformHighResultsData,
  title: () => _('Tasks by High Results per Host'),
  displayId: 'task-by-high-results-table',
  displayName: 'TasksHighResultsTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksHighResultsDisplay.displayId, TasksHighResultsDisplay, {
  title: _('Chart: Tasks by High Results per Host'),
});

registerDisplay(TasksHighResultsTableDisplay.displayId,
  TasksHighResultsTableDisplay, {
    title: _('Table: Tasks by High Results per Host'),
  },
);

// vim: set ts=2 sw=2 tw=80:
