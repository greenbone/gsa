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

import DataSource from '../components/dashboard/datasource.js';
import Chart from '../components/dashboard/chart.js';

export const OverrideCharts = ({filter}) => {
  return (
    <div>
      <DataSource
        name="override-created-count-source"
        aggregate-type="override"
        aggregate-mode="count"
        group-column="created"
        filter={filter}>
        <Chart
          name="override-by-created"
          title={_('Overrides by creation time')}
          title-count="count"
          type="line"
          gen-params={{is_timeline: 1}}/>
      </DataSource>
      <DataSource
        name="override-text-words-source"
        aggregate-type="override"
        group-column="text"
        aggregate-mode="word_counts"
        filter={filter}>
        <Chart
          name="override-by-text-words"
          title={_('Overrides text word cloud')}
          type="cloud"/>
      </DataSource>
      <DataSource
        name="override-status-source"
        aggregate-type="override"
        group-column="active_days"
        sort-stat="count"
        sort-order="descending"
        max-groups="250"
        filter={filter}>
        <Chart
          name="override-by-active-days"
          template="active_status"
          title={_('Overrides by active days')}
          title-count="count"
          type="donut"/>
      </DataSource>
    </div>
  );
};

OverrideCharts.propTypes = {
  filter: PropTypes.model,
};

export default OverrideCharts;

// vim: set ts=2 sw=2 tw=80:
