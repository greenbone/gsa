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

import  _ from '../../locale.js';

import PropTypes from '../proptypes.js';

import DataSource from '../dashboard/datasource.js';
import Chart from '../dashboard/chart.js';

const ResultCharts = ({filter, cache}) => {
  return (
    <div>
      <DataSource
        filter={filter}
        cache={cache}
        name="results-severity-count-source"
        group-column="severity"
        aggregate-type="result">
        <Chart
          name="result-by-cvss"
          type="bar"
          title={_('Results by CVSS')}
          title-count="count"
          template="info_by_cvss"/>
        <Chart
          name="result-by-severity-class"
          type="donut"
          title={_('Results by Severity Class')}
          title-count="count"
          template="info_by_class"/>
      </DataSource>
      <DataSource
        filter={filter}
        cache={cache}
        name="result-vuln-words-source"
        aggregate-type="result"
        group-column="vulnerability"
        aggregate-mode="word_counts"
        sort-stat="count"
        sort-order="descending"
        max-groups="250">
        <Chart
          name="result-by-vuln-words"
          type="cloud"
          title={_('Results vulnerability word cloud')}/>
      </DataSource>
      <DataSource
        filter={filter}
        cache={cache}
        name="result-desc-words-source"
        aggregate-type="result"
        group-column="description"
        aggregate-mode="word_counts"
        sort-stat="count"
        sort-order="descending"
        max-groups="250">
        <Chart
          name="result-by-desc-words"
          type="cloud"
          title={_('Results description word cloud')}/>
      </DataSource>
    </div>
  );
};

ResultCharts.propTypes = {
  cache: PropTypes.object,
  filter: PropTypes.filter,
};

export default ResultCharts;

// vim: set ts=2 sw=2 tw=80:
