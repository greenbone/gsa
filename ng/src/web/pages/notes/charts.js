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

const NoteCharts = ({filter}) => (
  <Wrapper>
    <DataSource
      name="note-created-count-source"
      aggregateType="note"
      aggregateMode="count"
      groupColumn="created"
      filter={filter}
    >
      <Chart
        name="note-by-created"
        title={_('Notes by creation time')}
        title-count="count"
        type="line"
        gen-params={{is_timeline: 1}}
      />
    </DataSource>
    <DataSource
      name="note-text-words-source"
      aggregateType="note"
      groupColumn="text"
      aggregateMode="word_counts"
      filter={filter}
    >
      <Chart
        name="note-by-text-words"
        title={_('Notes text word cloud')}
        type="cloud"
      />
    </DataSource>
    <DataSource
      name="note-active-status-source"
      aggregateType="note"
      groupColumn="active_days"
      sortStat="count"
      sortOrder="descending"
      maxGroups="250"
      filter={filter}
    >
      <Chart
        name="note-by-active-days"
        template="active_status"
        title={_('Notes by active days')}
        title-count="count"
        type="donut"
      />
    </DataSource>
  </Wrapper>
);

NoteCharts.propTypes = {
  filter: PropTypes.filter,
};

export default NoteCharts;

// vim: set ts=2 sw=2 tw=80:
