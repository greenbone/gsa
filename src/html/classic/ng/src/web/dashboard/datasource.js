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

import {is_defined} from '../../utils.js';

import PropTypes from '../proptypes.js';

export class DataSource extends React.Component {

  constructor(props) {
    super(props);

    let filter = this.props.filter ? this.props.filter.toFilterString() :
      undefined;

    let ds = new window.gsa.charts.DataSource(this.props.name, {
      cache: this.props.cache,
      type: this.props.type,
      group_column: this.props['group-column'],
      aggregate_type: this.props['aggregate-type'],
      subgroup_column: this.props['subgroup-column'],
      data_column: this.props.column,
      data_columns: this.props.columns,
      text_columns: this.props['text-columns'],
      sort_fields: this.props['sort-fields'],
      sort_orders: this.props['sort-orders'],
      sort_stats: this.props['sort-stats'],
      aggregate_mode: this.props['aggregate-mode'],
      max_groups: this.props['max-groups'],
      first_group: this.props['first-group'],
      filter,
    });

    this.state = {
      datasource: ds,
    };
  }

  getChildContext() {
    return {
      datasource: this.state.datasource,
    };
  }

  componentWillReceiveProps(props) {
    let {datasource} = this.state;
    let filter = this.props.filter ? this.props.filter.simple() : undefined;
    let newfilter = props.filter ? props.filter.simple() : undefined;

    // TODO charts should decide themself if they need to redraw if a filter has
    // changed in future. This should be changed when the charts a completly
    // converted to react. Until now we compare the filter without first, rows
    // and sort/sort-reverse params.
    let equals = filter ? filter.equals(newfilter) :
      !is_defined(newfilter);

    if (!equals) {
      datasource.setFilter(newfilter.toFilterString());
    }
  }

  render() {
    return <span>{this.props.children}</span>;
  }
}

DataSource.contextTypes = {
  dashboard: PropTypes.object.isRequired,
};

DataSource.childContextTypes = {
  datasource: PropTypes.object,
};

DataSource.propTypes = {
  cache: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  column: PropTypes.string,
  columns: PropTypes.array,
  filter: PropTypes.filter,
  'group-column': PropTypes.string,
  'aggregate-type': PropTypes.string,
  'subgroup-column': PropTypes.string,
  'text-columns': PropTypes.array,
  'sort-fields': PropTypes.array,
  'sort-orders': PropTypes.array,
  'sort-stats': PropTypes.array,
  'aggregate-mode': PropTypes.string,
  'max-groups': PropTypes.string,
  'first-group': PropTypes.string,
};

export default DataSource;

// vim: set ts=2 sw=2 tw=80:
