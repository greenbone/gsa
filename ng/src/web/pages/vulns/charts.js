/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

const VulnCharts = ({filter}) => (
  <Wrapper>
    <DataSource
      filter={filter}
      name="vuln-severity-count-source"
      groupColumn="severity"
      aggregateType="vuln"
    >
      <Chart
        name="vuln-by-cvss"
        title={_('Vulnerabilities by CVSS')}
        title-count="count"
        type="bar"
        template="info_by_cvss"
      />
      <Chart
        name="vuln-by-severity-class"
        title={_('Vulnerabilities by Severity Class')}
        title-count="count"
        type="donut"
        template="info_by_class"
      />
    </DataSource>
    <DataSource
      filter={filter}
      name="vuln-host-count-source"
      groupColumn="hosts"
      aggregateType="vuln"
    >
      <Chart
        name="vuln-by-hosts"
        title={_('Vulnerabilities by Hosts - Bar')}
        title-count="count"
        type="bar"
        template="quantile_histogram"
      />
      <Chart
        name="vuln-by-hosts-area"
        title={_('Vulnerabilities by Hosts - Area')}
        title-count="count"
        type="line"
        gen-params={{
          is_timeline: false,
          y_area: true,
          y2_area: false,
          quantile_fill: true,
          fill_in_missing: true,
        }}
        template="quantile_split"
      />
    </DataSource>
  </Wrapper>
);

VulnCharts.propTypes = {
  filter: PropTypes.filter,
};

export default VulnCharts;

// vim: set ts=2 sw=2 tw=80:
