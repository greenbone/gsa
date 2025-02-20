/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DonutChart from 'web/components/chart/Donut';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {
  totalCount,
  percent,
  qodColorScale,
} from 'web/components/dashboard/display/Utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import PropTypes from 'web/utils/PropTypes';

import {NvtsQodLoader} from './Loaders';

const transformQodData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);

    return {
      value: parseFloat(count),
      label: value + ' %',
      toolTip: `${value}%: ${perc}% (${count})`,
      color: qodColorScale(parseFloat(value)),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export class NvtsQodDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    const qodTerm = FilterTerm.fromString(`qod="${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(qodTerm)) {
      return;
    }
    const qodFilter = Filter.fromTerm(qodTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(qodFilter)
      : qodFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <NvtsQodLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformQodData}
            icons={renderDonutChartIcons}
            initialState={{
              show3d: true,
            }}
            title={({data: tdata}) =>
              _('NVTs by QoD (Total: {{count}})', {count: tdata.total})
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
      </NvtsQodLoader>
    );
  }
}

NvtsQodDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

NvtsQodDisplay = withFilterSelection({
  filtersFilter: NVTS_FILTER_FILTER,
})(NvtsQodDisplay);

NvtsQodDisplay.displayId = 'nvt-by-qod';

export const NvtsQodTableDisplay = createDisplay({
  loaderComponent: NvtsQodLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) =>
    _('NVTs by QoD (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('QoD'), _l('# of NVTs')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformQodData,
  displayId: 'nvt-by-qod-table',
  displayName: 'NvtsQodTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodDisplay.displayId, NvtsQodDisplay, {
  title: _l('Chart: NVTs by QoD'),
});

registerDisplay(NvtsQodTableDisplay.displayId, NvtsQodTableDisplay, {
  title: _l('Table: NVTs by QoD'),
});
