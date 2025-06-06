/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {format as d3format} from 'd3-format';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import BubbleChart from 'web/components/chart/Bubble';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {TasksHighResultsLoader} from 'web/pages/tasks/dashboard/Loaders';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {severityFormat} from 'web/utils/Render';
import {resultSeverityRiskFactor, _NA} from 'web/utils/severity';
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
      const displaySeverity = isDefined(severity)
        ? severityFormat(severity)
        : `${_NA}`;
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
            dataTransform={transformHighResultsData}
            filter={filter}
            severityRating={severityRating}
            showToggleLegend={false}
            title={() => _('Tasks by High Results per Host')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BubbleChart
                data={tdata}
                height={height}
                svgRef={svgRef}
                width={width}
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
  gmp: PropTypes.gmp.isRequired,
  navigate: PropTypes.func.isRequired,
};

TasksHighResultsDisplay = compose(
  withGmp,
  withRouter,
  withFilterSelection({
    filtersFilter: TASKS_FILTER_FILTER,
  }),
)(TasksHighResultsDisplay);

TasksHighResultsDisplay.displayId = 'task-by-high-results';

export const TasksHighResultsTableDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_l('Task Name'), _l('High per Host'), _l('Severity')],
  dataRow: row => [row.label, row.value, row.severity],
  dataTransform: transformHighResultsData,
  title: () => _l('Tasks by High Results per Host'),
  displayId: 'task-by-high-results-table',
  displayName: 'TasksHighResultsTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksHighResultsDisplay.displayId, TasksHighResultsDisplay, {
  title: _l('Chart: Tasks by High Results per Host'),
});

registerDisplay(
  TasksHighResultsTableDisplay.displayId,
  TasksHighResultsTableDisplay,
  {
    title: _l('Table: Tasks by High Results per Host'),
  },
);
