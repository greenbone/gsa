/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {isDefined} from 'gmp/utils/identity';
import DonutChart from 'web/components/chart/Donut';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {
  totalCount,
  percent,
  qodTypeColorScale,
  QOD_TYPES,
} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {NvtsQodTypeLoader} from 'web/pages/nvts/dashboard/Loaders';
import PropTypes from 'web/utils/PropTypes';

const transformQodTypeData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: count,
      label: `${QOD_TYPES[value]}`,
      toolTip: `${QOD_TYPES[value]}: ${perc}% (${count})`,
      color: qodTypeColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export class NvtsQodTypeDisplay extends React.Component {
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

    const qodTypeTerm = FilterTerm.fromString(`qod_type="${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(qodTypeTerm)) {
      return;
    }
    const qodTypeFilter = Filter.fromTerm(qodTypeTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(qodTypeFilter)
      : qodTypeFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <NvtsQodTypeLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformQodTypeData}
            icons={renderDonutChartIcons}
            initialState={{
              show3d: true,
            }}
            title={({data: tdata}) =>
              _('NVTs by QoD-Type (Total: {{count}})', {count: tdata.total})
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
      </NvtsQodTypeLoader>
    );
  }
}

NvtsQodTypeDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

NvtsQodTypeDisplay = withFilterSelection({
  filterFilter: NVTS_FILTER_FILTER,
})(NvtsQodTypeDisplay);

NvtsQodTypeDisplay.displayId = 'nvt-by-qod_type';

export const NvtsQodTypeTableDisplay = createDisplay({
  loaderComponent: NvtsQodTypeLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) =>
    _('NVTs by QoD-Type (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('QoD-Type'), _l('# of NVTs')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformQodTypeData,
  displayId: 'nvt-by-qod-type-table',
  displayName: 'NvtsQodTypeTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodTypeDisplay.displayId, NvtsQodTypeDisplay, {
  title: _l('Chart: NVTs by QoD-Type'),
});

registerDisplay(NvtsQodTypeTableDisplay.displayId, NvtsQodTypeTableDisplay, {
  title: _l('Table: NVTs by QoD-Type'),
});
