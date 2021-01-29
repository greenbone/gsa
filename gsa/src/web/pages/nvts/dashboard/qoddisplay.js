/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import DonutChart from 'web/components/chart/donut';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons'; // eslint-disable-line max-len
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len

import {
  totalCount,
  percent,
  qodColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import PropTypes from 'web/utils/proptypes';

import {NvtsQodLoader} from './loaders';

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
            title={({data: tdata}) =>
              _('NVTs by QoD (Total: {{count}})', {count: tdata.total})
            }
            initialState={{
              show3d: true,
            }}
            icons={renderDonutChartIcons}
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                show3d={state.show3d}
                showLegend={state.showLegend}
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

// vim: set ts=2 sw=2 tw=80:
