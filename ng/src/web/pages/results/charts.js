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

import Wrapper from '../../components/layout/wrapper.js';

import PropTypes from '../../utils/proptypes.js';

import DataSource from '../../components/dashboard/datasource.js';
import Chart from '../../components/dashboard/chart.js';

const ResultCharts = ({filter}) => (
  <Wrapper>
    <DataSource
      filter={filter}
      name="results-severity-count-source"
      groupColumn="severity"
      aggregateType="result"
    >
      <Chart
        name="result-by-cvss"
        type="bar"
        title={_('Results by CVSS')}
        title-count="count"
        template="info_by_cvss"
      />
      <Chart
        name="result-by-severity-class"
        type="donut"
        title={_('Results by Severity Class')}
        title-count="count"
        template="info_by_class"
      />
    </DataSource>
    <DataSource
      filter={filter}
      name="result-vuln-words-source"
      aggregateType="result"
      groupColumn="vulnerability"
      aggregateMode="word_counts"
      sortStat="count"
      sortOrder="descending"
      maxGroups="250"
    >
      <Chart
        name="result-by-vuln-words"
        type="cloud"
        title={_('Results vulnerability word cloud')}
      />
    </DataSource>
    <DataSource
      filter={filter}
      name="result-desc-words-source"
      aggregateType="result"
      groupColumn="description"
      aggregateMode="word_counts"
      sortStat="count"
      sortOrder="descending"
      maxGroups="250"
    >
      <Chart
        name="result-by-desc-words"
        type="cloud"
        title={_('Results description word cloud')}
      />
    </DataSource>
  </Wrapper>
);

ResultCharts.propTypes = {
  filter: PropTypes.filter,
};

export default ResultCharts;

// vim: set ts=2 sw=2 tw=80:
