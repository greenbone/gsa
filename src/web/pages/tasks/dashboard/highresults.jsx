/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {withRouter} from 'react-router-dom';

import {format as d3format} from 'd3-format';

import {_, _l} from 'gmp/locale/lang';

import {parseFloat, parseSeverity} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

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
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';

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
    const {history} = this.props;

    history.push(`/task/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <TasksHighResultsLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformHighResultsData}
            title={() => _('Tasks by High Results per Host')}
            showToggleLegend={false}
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
  history: PropTypes.object.isRequired,
};

TasksHighResultsDisplay = compose(
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

// vim: set ts=2 sw=2 tw=80:
