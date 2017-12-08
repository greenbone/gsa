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

import DataSource from './datasource.js';
import Chart from './chart.js';

const CommonCharts = ({
  filter,
  type,
  titleType,
}) => (
  <Wrapper>
    <DataSource
      name={type + '-severity-count-source'}
      aggregateType={type}
      groupColumn="severity"
      filter={filter}
    >
      <Chart
        name={type + '-by-cvss'}
        type="bar"
        title={_('{{title}} by CVSS', {title: titleType})}
        title-count="count"
        template="info_by_cvss"
      />
      <Chart
        name={type + '-by-severity-class'}
        type="donut"
        title={_('{{title}} by Severity Class', {title: titleType})}
        title-count="count"
        template="info_by_class"
      />
    </DataSource>
    <DataSource
      name={type + '-created-count-source'}
      aggregateType={type}
      groupColumn="created"
      filter={filter}
    >
      <Chart
        name={type + '-by-created'}
        title={_('{{title}} by creation time', {title: titleType})}
        title-count="count"
        type="line"
        gen-params={{is_timeline: 1}}
      />
    </DataSource>
  </Wrapper>
);

CommonCharts.propTypes = {
  filter: PropTypes.filter,
  titleType: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default CommonCharts;

// vim: set ts=2 sw=2 tw=80:
