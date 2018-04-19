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
import {parse_float} from 'gmp/parser';
import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../../components/chart/donut3d';
import DataDisplay from '../../../components/dashboard2/display/datadisplay';
import {
  totalCount,
  percent,
  qodColorScale,
} from '../../../components/dashboard2/display/utils';
import {registerDisplay} from '../../../components/dashboard2/registry';

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

class NvtsQodDisplay extends React.Component {

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
            {({width, height, data: tdata}) => (
              <DonutChart
                data={tdata}
                height={height}
                width={width}
                onDataClick={this.handleDataClick}
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

const DISPLAY_ID = 'nvt-by-qod';

NvtsQodDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, NvtsQodDisplay, {
  title: _('NVTs by QoD'),
});

export default NvtsQodDisplay;

// vim: set ts=2 sw=2 tw=80:
