/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import {format as d3format} from 'd3-format';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import React from 'react';
import BarChart from 'web/components/chart/bar';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';  
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';  
import {registerDisplay} from 'web/components/dashboard/registry';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {resultSeverityRiskFactor} from 'web/utils/severity';
import {withRouter} from 'web/utils/withRouter';

import {TasksHighResultsLoader} from './loaders';

const format = d3format('0.2f');

const transformHighResultsData = (data = {}) => {
  const {groups = []} = data;

  return groups
    .filter(group => {
      const {text = {}} = group;
      const {high_per_host = 0} = text;
      return parseFloat(high_per_host) > 0;
    })
    .map(group => {
      const {text, value: id} = group;
      const {name} = text;
      const high_per_host = parseFloat(text.high_per_host);
      const severity = parseSeverity(text.severity);
      const riskFactor = resultSeverityRiskFactor(severity);
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

export class TasksMostHighResultsDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {navigate} = this.props;

    navigate(`/task/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <TasksHighResultsLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataRow={row => [row.x, row.y]}
            dataTitles={[_('Task Name'), _('Max. High per Host')]}
            dataTransform={transformHighResultsData}
            filter={filter}
            showToggleLegend={false}
            title={() => _('Tasks with most High Results per Host')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BarChart
                horizontal
                data={tdata}
                height={height}
                showLegend={false}
                svgRef={svgRef}
                width={width}
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
  navigate: PropTypes.func.isRequired,
};

TasksMostHighResultsDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: TASKS_FILTER_FILTER,
  }),
)(TasksMostHighResultsDisplay);

TasksMostHighResultsDisplay.displayId = 'task-by-most-high-results';

export const TasksMostHighResultsTableDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_l('Task Name'), _l('Max. High per Host')],
  dataRow: row => [row.x, row.y],
  dataTransform: transformHighResultsData,
  title: () => _('Tasks with most High Results per Host'),
  displayId: 'task-by-most-high-results-table',
  displayName: 'TasksMostHighResultsTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksMostHighResultsDisplay.displayId,
  TasksMostHighResultsDisplay,
  {
    title: _l('Chart: Tasks with most High Results per Host'),
  },
);

registerDisplay(
  TasksMostHighResultsTableDisplay.displayId,
  TasksMostHighResultsTableDisplay,
  {
    title: _l('Table: Tasks with most High Results per Host'),
  },
);

// vim: set ts=2 sw=2 tw=80:
