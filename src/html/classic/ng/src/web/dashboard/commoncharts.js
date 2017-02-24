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

import  _ from '../../locale.js';

import DataSource from '../dashboard/datasource.js';
import Chart from '../dashboard/chart.js';

export const CommonCharts = props => {
  let {filter, type, titleType, cache} = props;

  return (
    <div>
      <DataSource
        name={type + '-severity-count-source'}
        cache={cache}
        aggregate-type={type}
        group-column="severity"
        filter={filter}>
        <Chart
          name={type + '-by-cvss'}
          type="bar"
          title={_('{{title}} by CVSS', {title: titleType})}
          title-count="count"
          template="info_by_cvss"/>
        <Chart
          name={type + '-by-severity-class'}
          type="donut"
          title={_('{{title}} by Severity Class', {title: titleType})}
          title-count="count"
          template="info_by_class"/>
      </DataSource>
      <DataSource
        name={type + '-created-count-source'}
        cache={cache}
        aggregate-type={type}
        group-column="created"
        filter={filter}>
        <Chart
          name={type + '-by-created'}
          title={_('{{title}} by creation time', {title: titleType})}
          title-count="count"
          type="line"
          gen-params={{is_timeline: 1}}/>
      </DataSource>
    </div>
  );
};

CommonCharts.propTypes = {
  cache: React.PropTypes.object,
  filter: React.PropTypes.object,
  type: React.PropTypes.string.isRequired,
  titleType: React.PropTypes.string.isRequired,
};

export default CommonCharts;

// vim: set ts=2 sw=2 tw=80:
