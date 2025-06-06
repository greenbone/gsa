/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {format as d3format} from 'd3-format';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/Bar';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {TasksHighResultsLoader} from 'web/pages/tasks/dashboard/Loaders';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {resultSeverityRiskFactor} from 'web/utils/severity';
import withGmp from 'web/utils/withGmp';
import {withRouter} from 'web/utils/withRouter';

const format = d3format('0.2f');

const transformHighResultsData = (
  data = {},
  {severityRating = DEFAULT_SEVERITY_RATING} = {},
) => {
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
      const riskFactor = resultSeverityRiskFactor(severity, severityRating);
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
    const {filter, gmp, ...props} = this.props;
    const severityRating = gmp.settings.severityRating;
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
            severityRating={severityRating}
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
  gmp: PropTypes.gmp.isRequired,
  navigate: PropTypes.func.isRequired,
};

TasksMostHighResultsDisplay = compose(
  withGmp,
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
