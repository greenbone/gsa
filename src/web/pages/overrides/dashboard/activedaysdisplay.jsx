/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DonutChart from 'web/components/chart/donut';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';
import {
  totalCount,
  percent,
  activeDaysColorScale,
} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/registry';
import PropTypes from 'web/utils/proptypes';

import {OverridesActiveDaysLoader} from './loaders';

const MAX_BINS = 10; // if this is changed, activeDaysColorScale needs adjustment

const ACTIVE_YES_ALWAYS_VALUE = -2;
const ACTIVE_NO_VALUE = -1;

const transformActiveDaysData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  // if more than MAX_BINS groups are loaded, bulk the last ones (those
  // overrides that are active the longest) into one bin
  if (groups.length > MAX_BINS) {
    // cut off array after MAX_BINS
    const mostActiveDaysBin = groups.splice(MAX_BINS - 1);
    // get last value of the shortened group-array, as it is the largest value
    // to be shown separately. The bulked group will be labeled as bigger than
    // this value
    const {value} = groups[groups.length - 1];

    const count = mostActiveDaysBin.reduce(
      (prev, current) => prev + parseFloat(current.count),
      0,
    );
    const reducedMostActiveDaysBin = {
      value,
      count,
      bulked: true, // used as flag for special label
    };

    groups.push(reducedMostActiveDaysBin);
  }

  let colorCounter = 1;
  const tdata = groups.map(group => {
    const {bulked, count, value} = group;
    const perc = percent(count, sum);
    let label = '';
    switch (value) {
      case ACTIVE_YES_ALWAYS_VALUE:
        label = _('Active (unlimited)');
        break;
      case ACTIVE_NO_VALUE:
        label = _('Inactive');
        break;
      default:
        if (group.bulked) {
          label = _('Active for > {{value}} days', {value});
        } else {
          label = _('Active for the next {{value}} days', {value});
        }
        break;
    }
    return {
      value: count,
      label,
      bulked,
      toolTip: `${label}: ${perc}% (${count})`,
      color: activeDaysColorScale(colorCounter++),
      filterValue: value,
    };
  });

  tdata.total = sum;
  return tdata;
};

export class OverridesActiveDaysDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue, bulked = false} = data;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let activeDaysTerm;
    if (bulked) {
      activeDaysTerm = FilterTerm.fromString(`active_days>"${filterValue}"`);
    } else {
      activeDaysTerm = FilterTerm.fromString(`active_days="${filterValue}"`);
    }

    if (isDefined(filter) && filter.hasTerm(activeDaysTerm)) {
      return;
    }
    const activeDaysFilter = Filter.fromTerm(activeDaysTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(activeDaysFilter)
      : activeDaysFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <OverridesActiveDaysLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformActiveDaysData}
            filter={filter}
            icons={renderDonutChartIcons}
            initialState={{
              show3d: true,
            }}
            title={({data: tdata}) =>
              _('Overrides by Active Days (Total: {{count}})', {
                count: tdata.total,
              })
            }
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <DonutChart
                data={tdata}
                height={height}
                show3d={state.show3d}
                showLegend={state.showLegend}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </OverridesActiveDaysLoader>
    );
  }
}

OverridesActiveDaysDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

OverridesActiveDaysDisplay = withFilterSelection({
  filtersFilter: OVERRIDES_FILTER_FILTER,
})(OverridesActiveDaysDisplay);

OverridesActiveDaysDisplay.displayId = 'override-by-active-days';

export const OverridesActiveDaysTableDisplay = createDisplay({
  loaderComponent: OverridesActiveDaysLoader,
  displayComponent: DataTableDisplay,
  dataRow: row => [row.label, row.value],
  dataTitles: [_l('Active'), _l('# of Overrides')],
  dataTransform: transformActiveDaysData,
  title: ({data: tdata}) =>
    _('Overrides by Active Days (Total: {{count}})', {count: tdata.total}),
  displayName: 'OverridesActiveDaysTableDisplay',
  displayId: 'override-by-active-days-table',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesActiveDaysDisplay.displayId,
  OverridesActiveDaysDisplay,
  {
    title: _l('Chart: Overrides by Active Days'),
  },
);

registerDisplay(
  OverridesActiveDaysTableDisplay.displayId,
  OverridesActiveDaysTableDisplay,
  {
    title: _l('Table: Overrides by Active Days'),
  },
);
