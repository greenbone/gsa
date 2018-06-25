/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import Filter, {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import FilterTerm from 'gmp/models/filter/filterterm';
import {parse_float} from 'gmp/parser';
import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut3d';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len

import {
  totalCount,
  percent,
  qodColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import {NvtsQodLoader} from './loaders';

const transformQodData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);

    return {
      value: parse_float(count),
      label: value + ' %',
      toolTip: `${value}%: ${perc}% (${count})`,
      color: qodColorScale(parse_float(value)),
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

    if (!is_defined(onFilterChanged)) {
      return;
    }

    const qodTerm = FilterTerm.fromString(`qod="${filterValue}"`);

    if (is_defined(filter) && filter.hasTerm(qodTerm)) {
      return;
    }
    const qodFilter = Filter.fromTerm(qodTerm);

    const newFilter = is_defined(filter) ? filter.copy().and(qodFilter) :
      qodFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;

    return (
      <NvtsQodLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformQodData}
            title={({data: tdata}) => _('NVTs by QoD (Total: {{count}})',
              {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={is_defined(onFilterChanged) ?
                  this.handleDataClick : undefined}
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
  onFilterChanged: PropTypes.func.isRequired,
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
  dataTitles: [_('QoD'), _('# of NVTs')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformQodData,
  displayId: 'nvt-by-qod-table',
  displayName: 'NvtsQodTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodDisplay.displayId, NvtsQodDisplay, {
  title: _('Chart: NVTs by QoD'),
});

registerDisplay(NvtsQodTableDisplay.displayId, NvtsQodTableDisplay, {
  title: _('Table: NVTs by QoD'),
});

// vim: set ts=2 sw=2 tw=80:
