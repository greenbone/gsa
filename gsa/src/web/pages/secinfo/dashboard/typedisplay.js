/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {_, _l} from 'gmp/locale/lang';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {SECINFO_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons'; // eslint-disable-line max-len
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {
  totalCount,
  percent,
  secInfoTypeColorScale,
  SEC_INFO_TYPES,
} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard/registry';

import {SecInfosTypeLoader} from './loaders';

const transformTypeData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: count,
      label: `${SEC_INFO_TYPES[value]}`,
      toolTip: `${SEC_INFO_TYPES[value]}: ${perc}% (${count})`,
      color: secInfoTypeColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export class SecInfosTypeDisplay extends React.Component {
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

    const typeTerm = FilterTerm.fromString(`type="${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(typeTerm)) {
      return;
    }
    const typeFilter = Filter.fromTerm(typeTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(typeFilter)
      : typeFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <SecInfosTypeLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformTypeData}
            title={({data: tdata}) =>
              _('SecInfo Items by Type (Total: {{count}})', {
                count: tdata.total,
              })
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
      </SecInfosTypeLoader>
    );
  }
}

SecInfosTypeDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
};

SecInfosTypeDisplay = withFilterSelection({
  filtersFilter: SECINFO_FILTER_FILTER,
})(SecInfosTypeDisplay);

SecInfosTypeDisplay.displayId = 'allinfo-by-type';

export const SecInfosTypeTableDisplay = createDisplay({
  loaderComponent: SecInfosTypeLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) =>
    _('SecInfo Items by type (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Type'), _l('# of SecInfo Items')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformTypeData,
  displayId: 'allinfo-by-type-table',
  displayName: 'SecInfoTypeTableDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

registerDisplay(SecInfosTypeDisplay.displayId, SecInfosTypeDisplay, {
  title: _l('Chart: SecInfo Items by Type'),
});

registerDisplay(SecInfosTypeTableDisplay.displayId, SecInfosTypeTableDisplay, {
  title: _l('Table: SecInfo Items by Type'),
});

// vim: set ts=2 sw=2 tw=80:
