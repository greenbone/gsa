/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {_, _l} from 'gmp/locale/lang';
import Filter, {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseInt, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import LineChart, {lineDataPropType} from 'web/components/chart/line';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';  
import {totalCount} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';  
import {registerDisplay} from 'web/components/dashboard/registry';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';

import {HostsModifiedLoader} from './loaders';

const transformModified = (data = {}) => {
  let {groups = []} = data;
  groups = groups.filter(group => group.subgroup.value === 'High');
  const sum = totalCount(groups);
  const tdata = groups.map(group => {
    const {value, count, c_count} = group;
    const modified = parseDate(value);
    return {
      x: modified,
      label: formattedUserSettingShortDate(modified),
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });

  tdata.total = sum;
  return tdata;
};

export class HostsModifiedHighDisplay extends React.Component {
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
        `modified>${startDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (isDefined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `modified<${endDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <HostsModifiedLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformModified}
            filter={filter}
            title={({data: tdata}) =>
              _('Hosts (High) by Modification Time (Total: {{count}})', {
                count: tdata.total,
              })
            }
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
                y2AxisLabel={_('Total Hosts (High)')}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Total Hosts (High)'),
                }}
                yAxisLabel={_('# of Modified Hosts (High)')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Modified Hosts (High)'),
                }}
                onRangeSelected={this.handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </HostsModifiedLoader>
    );
  }
}

HostsModifiedHighDisplay.propTypes = {
  filter: PropTypes.filter,
  xAxisLabel: PropTypes.string,
  y2AxisLabel: PropTypes.string,
  y2Line: lineDataPropType,
  yAxisLabel: PropTypes.string,
  yLine: lineDataPropType,
  onFilterChanged: PropTypes.func,
};

HostsModifiedHighDisplay = withFilterSelection({
  filtersFilter: HOSTS_FILTER_FILTER,
})(HostsModifiedHighDisplay);

HostsModifiedHighDisplay.displayId = 'host-by-high-modification-time';

export const HostsModifiedHighTableDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformModified,
  title: ({data: tdata}) =>
    _('Hosts (High) by Modification Time (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [
    _l('Creation Time'),
    _l('# of Modified Hosts (High)'),
    _l('Total Hosts (High)'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-high-modification-time-table',
  displayName: 'HostsModifiedHighTableDisplay',
});

registerDisplay(HostsModifiedHighDisplay.displayId, HostsModifiedHighDisplay, {
  title: _l('Chart: Hosts (High) by Modification Time'),
});

registerDisplay(
  HostsModifiedHighTableDisplay.displayId,
  HostsModifiedHighTableDisplay,
  {
    title: _l('Table: Hosts (High) by Modification Time'),
  },
);

// vim: set ts=2 sw=2 tw=80:
