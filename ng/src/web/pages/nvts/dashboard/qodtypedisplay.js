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

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';
import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../../components/chart/donut3d';
import DataDisplay from '../../../components/dashboard2/display/datadisplay';
import {
  totalCount,
  percent,
  qodTypeColorScale,
  QOD_TYPES,
} from '../../../components/dashboard2/display/utils';
import {registerDisplay} from '../../../components/dashboard2/registry';

import {NvtsQodTypeLoader} from './loaders';

const transformQodTypeData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: count,
      label: QOD_TYPES[value],
      toolTip: `${QOD_TYPES[value]}: ${perc}% (${count})`,
      color: qodTypeColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

class NvtsQodTypeDisplay extends React.Component {

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

    const qodTypeTerm = FilterTerm.fromString(`qod_type="${filterValue}"`);

    if (is_defined(filter) && filter.hasTerm(qodTypeTerm)) {
      return;
    }
    const qodTypeFilter = Filter.fromTerm(qodTypeTerm);

    const newFilter = is_defined(filter) ? filter.copy().and(qodTypeFilter) :
      qodTypeFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;

    return (
      <NvtsQodTypeLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformQodTypeData}
            dataTitles={[_('QoD-Type'), _('# of NVTs')]}
            dataRow={({row}) => [row.label, row.value]}
            title={({data: tdata}) => _('NVTs by QoD-Type (Total: {{count}})',
              {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={this.handleDataClick}
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
  onFilterChanged: PropTypes.func.isRequired,
};

const DISPLAY_ID = 'nvt-by-qod_type';

NvtsQodTypeDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, NvtsQodTypeDisplay, {
  title: _('NVTs by QoD-Type'),
});

export default NvtsQodTypeDisplay;

// vim: set ts=2 sw=2 tw=80:
