/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

const OsCharts = ({filter}) => (
  <Wrapper>
    <DataSource
      name="os-average-severity-count-source"
      groupColumn="average_severity"
      aggregateType="os"
      filter={filter}
    >
      <Chart
        name="os-by-cvss"
        type="bar"
        title={_('Operating Systems by CVSS')}
        title-count="count"
        template="info_by_cvss"
      />
      <Chart
        name="os-by-severity-class"
        title={_('Operating Systems by Severity Class')}
        title-count="count"
        type="donut"
        template="info_by_class"
      />
    </DataSource>
    <DataSource
      name="os-most-vulnerable-source"
      aggregateType="os"
      groupColumn="uuid"
      columns={['average_severity', 'average_severity_score', 'hosts']}
      textColumns={['name', 'modified']}
      sortFields={['average_severity_score', 'modified']}
      sortOrders={['descending', 'descending']}
      sortStats={['max', 'value']}
      filter={filter}
    >
      <Chart
        name="os-by-most-vulnerable"
        type="horizontal_bar"
        x-field="name"
        y-fields={['average_severity_score_max']}
        z-fields={['average_severity_max']}
        gen-params={{
          empty_text: _('No vulnerable Operating Systems found'),
          score_severity: 'average_severity_max',
          score_assets: 'hosts_max',
          score_asset_type: 'hosts',
          extra_tooltip_field_1: _('modified'),
          extra_tooltip_label_1: _('Updated'),
        }}
        title={_('Operating Systems by Vulnerability Score')}
      />
    </DataSource>
  </Wrapper>
);

OsCharts.propTypes = {
  filter: PropTypes.filter,
};

export default OsCharts;

// vim: set ts=2 sw=2 tw=80:
