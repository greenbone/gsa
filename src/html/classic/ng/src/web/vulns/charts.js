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

import  _ from '../../locale.js';

import DataSource from '../dashboard/datasource.js';
import Chart from '../dashboard/chart.js';

export const VulnCharts = props => {
  let {filter} = props;

  return (
    <div>
      <DataSource
        filter={filter}
        name="vuln-severity-count-source"
        group-column="severity"
        aggregate-type="vuln">
        <Chart
          name="vuln-by-cvss"
          title={_('Vulnerabilities by CVSS')}
          title-count="count"
          type="bar"
          template="info_by_cvss"/>
        <Chart
          name="vuln-by-severity-class"
          title={_('Vulnerabilities by Severity Class')}
          title-count="count"
          type="donut"
          template="info_by_class"/>
      </DataSource>
      <DataSource
        filter={filter}
        name="vuln-host-count-source"
        group-column="hosts"
        aggregate-type="vuln">
        <Chart
          name="vuln-by-hosts"
          title={_('Vulnerabilities by Hosts - Bar')}
          title-count="count"
          type="bar"
          template="quantile_histogram"/>
        <Chart
          name="vuln-by-hosts-area"
          title={_('Vulnerabilities by Hosts - Area')}
          title-count="count"
          type="line"
          gen-params={{
            is_timeline: 0,
            y_area: 1,
            y2_area: 0,
            quantile_fill: 1,
            fill_in_missing: 1
          }}
          template="quantile_split"/>
      </DataSource>
    </div>
  );
};

VulnCharts.propTypes = {
  filter: React.PropTypes.object,
};

export default VulnCharts;

// vim: set ts=2 sw=2 tw=80:
