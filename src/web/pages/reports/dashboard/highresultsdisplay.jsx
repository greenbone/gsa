/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseInt, parseFloat, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import LineChart from 'web/components/chart/line';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/registry';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import {formattedUserSettingLongDate} from 'web/utils/userSettingTimeDateFormatters';

import {ReportsHighResultsLoader} from './loaders';

const transformHighResults = (data = {}) => {
  const {groups = []} = data;
  return groups.map(group => {
    const reportDate = parseDate(group.value);
    return {
      label: formattedUserSettingLongDate(reportDate),
      x: reportDate,
      y: parseInt(group.stats.high.max),
      y2: parseFloat(group.stats.high_per_host.max),
    };
  });
};

export class ReportsHighResultsDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleRangeSelect = this.handleRangeSelect.bind(this);
  }

  handleRangeSelect(start, end) {
    const {filter, onFilterChanged} = this.props;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let {x: startDate} = start;
    let {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    let newFilter = isDefined(filter) ? filter.copy() : new Filter();

    if (isDefined(startDate)) {
      if (startDate.isSame(endDate)) {
        startDate = startDate.clone().subtract(1, 'day');
        endDate = endDate.clone().add(1, 'day');
      }

      const startTerm = FilterTerm.fromString(
        `date>${startDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (isDefined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `date<${endDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {filter} = this.props;
    return (
      <ReportsHighResultsLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...this.props}
            {...loaderProps}
            dataTransform={transformHighResults}
            filter={filter}
            title={() => _('Reports with High Results')}
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <LineChart
                timeline
                data={tdata}
                height={height}
                showLegend={state.showLegend}
                svgRef={svgRef}
                width={width}
                xAxisLabel={_('Time')}
                y2AxisLabel={_('Max High per Host')}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Max High per Host'),
                }}
                yAxisLabel={_('Max High')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Max High'),
                }}
                onRangeSelected={this.handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </ReportsHighResultsLoader>
    );
  }
}

ReportsHighResultsDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};
ReportsHighResultsDisplay = withFilterSelection({
  filtersFilter: REPORTS_FILTER_FILTER,
})(ReportsHighResultsDisplay);

ReportsHighResultsDisplay.displayId = 'report-by-high-results';

export const ReportsHighResultsTableDisplay = createDisplay({
  loaderComponent: ReportsHighResultsLoader,
  displayComponent: DataTableDisplay,
  filtersFilter: REPORTS_FILTER_FILTER,
  dataTransform: transformHighResults,
  dataTitles: [_l('Created Time'), _l('Max High'), _l('Max High per Host')],
  dataRow: row => [row.label, row.y, row.y2],
  title: () => _('Reports with High Results'),
  displayName: 'ReportsHighResultsTableDisplay',
  displayId: 'report-by-high-results-table',
});

registerDisplay(
  ReportsHighResultsDisplay.displayId,
  ReportsHighResultsDisplay,
  {
    title: _l('Chart: Reports with high Results'),
  },
);

registerDisplay(
  ReportsHighResultsTableDisplay.displayId,
  ReportsHighResultsTableDisplay,
  {
    title: _l('Table: Reports with high Results'),
  },
);
