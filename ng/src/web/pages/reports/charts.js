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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import DataSource from '../../components/dashboard/datasource.js';
import Chart from '../../components/dashboard/chart.js';

const ReportCharts = ({filter}) => (
  <Wrapper>
    <DataSource
      name="report-high-results-timeline-source"
      aggregateType="report"
      groupColumn="date"
      columns={['high', 'high_per_host']}
      filter={filter}
    >
      <Chart
        name="report-by-high-results"
        type="line"
        y-fields={['high_max']}
        z-fields={['high_per_host_max']}
        title={_('Reports: High results timeline')}
        gen-params={{show_stat_type: 0, is_timeline: 1}}
      />
    </DataSource>
    <DataSource
      name="report-severity-count-source"
      groupColumn="severity"
      aggregateType="report"
      filter={filter}
    >
      <Chart
        name="report-by-cvss"
        type="bar"
        title={_('Reports by CVSS')}
        title-count="count"
        template="info_by_cvss"
      />
      <Chart
        name="report-by-severity-class"
        type="donut"
        title={_('Reports by Severity Class')}
        title-count="count"
        template="info_by_class"
      />
    </DataSource>
  </Wrapper>
);

ReportCharts.propTypes = {
  filter: PropTypes.filter,
};

export default ReportCharts;

// vim: set ts=2 sw=2 tw=80:
