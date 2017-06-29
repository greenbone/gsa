/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import DataSource from '../../components/dashboard/datasource.js';
import Chart from '../../components/dashboard/chart.js';
import CommonCharts from '../../components/dashboard/commoncharts.js';

export const NvtCharts = ({filter}) => {
  return (
    <div>
      <CommonCharts type="nvt" titleType="NVTs"
        filter={filter}/>
      <DataSource
        name="nvt-by-family-source"
        aggregate-type="nvt"
        group-column="family"
        column="severity"
        filter={filter}>
        <Chart
          name="nvt-by-family"
          title={_('NVTs by Family')}
          title-count="size_value"
          type="bubbles"/>
      </DataSource>
      <DataSource
        name="nvt-by-qod-type-source"
        aggregate-type="nvt"
        group-column="qod_type"
        filter={filter}>
        <Chart
          name="nvt-by-qod_type"
          template="qod_type_counts"
          title={_('NVTs by QoD type')}
          title-count="count"
          type="donut"/>
      </DataSource>
      <DataSource
        name="nvt-by-qod-source"
        aggregate-type="nvt"
        group-column="qod"
        filter={filter}>
        <Chart
          name="nvt-by-qod"
          template="percentage_counts"
          title={_('NVTs by QoD')}
          title-count="count"
          type="donut"/>
      </DataSource>
    </div>
  );
};

NvtCharts.propTypes = {
  filter: PropTypes.filter,
};

export default NvtCharts;

// vim: set ts=2 sw=2 tw=80:
