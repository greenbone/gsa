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

import {is_defined} from '../../utils.js';

export class DataSource extends React.Component {

  constructor(props) {
    super(props);

    let filter = this.props.filter ? this.props.filter.toFilterString() :
      undefined;

    let ds = new window.gsa.charts.DataSource(this.props.name, {
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
    let {filter} = this.props;

    let equals = filter ? filter.equals(props.filter) :
      !is_defined(props.filter);

    if (!equals) {
      datasource.setFilter(props.filter.toFilterString());
    }
  }

  render() {
    return <span>{this.props.children}</span>;
  }
}

DataSource.contextTypes = {
  dashboard: React.PropTypes.object.isRequired,
};

DataSource.childContextTypes = {
  datasource: React.PropTypes.object,
};

DataSource.propTypes = {
  name: React.PropTypes.string.isRequired,
  type: React.PropTypes.string,
  column: React.PropTypes.string,
  columns: React.PropTypes.array,
  filter: React.PropTypes.object,
  'group-column': React.PropTypes.string,
  'aggregate-type': React.PropTypes.string,
  'subgroup-column': React.PropTypes.string,
  'text-columns': React.PropTypes.array,
  'sort-fields': React.PropTypes.array,
  'sort-orders': React.PropTypes.array,
  'sort-stats': React.PropTypes.array,
  'aggregate-mode': React.PropTypes.string,
  'max-groups': React.PropTypes.string,
  'first-group': React.PropTypes.string,
};

export default DataSource;

// vim: set ts=2 sw=2 tw=80:
