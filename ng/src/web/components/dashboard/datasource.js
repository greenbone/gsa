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

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import LegacyDataSource from './legacy/datasource.js';

class DataSource extends React.Component {

  constructor(...args) {
    super(...args);

    const filter = is_defined(this.props.filter) ?
      this.props.filter.toFilterString() : undefined;

    const {gmp} = this.props;

    const ds = new LegacyDataSource(this.props.name, gmp.token, {
      cache: this.context.cache,
      type: this.props.type,
      group_column: this.props.groupColumn,
      aggregate_type: this.props.aggregateType,
      subgroup_column: this.props.subgroupColumn,
      data_column: this.props.column,
      data_columns: this.props.columns,
      text_columns: this.props.textColumns,
      sort_fields: this.props.sortFields,
      sort_orders: this.props.sortOrders,
      sort_stats: this.props.sortStats,
      aggregate_mode: this.props.aggregateMode,
      max_groups: this.props.maxGroups,
      first_group: this.props.firstGroup,
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
    const {datasource} = this.state;
    const filter = this.props.filter ? this.props.filter.simple() : undefined;
    const newfilter = props.filter ? props.filter.simple() : undefined;

    // TODO charts should decide themself if they need to redraw if a filter has
    // changed in future. This should be changed when the charts a completly
    // converted to react. Until now we compare the filter without first, rows
    // and sort/sort-reverse params.
    const equals = filter ? filter.equals(newfilter) :
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
  cache: PropTypes.cache,
};

DataSource.childContextTypes = {
  datasource: PropTypes.object,
};

DataSource.propTypes = {
  aggregateMode: PropTypes.string,
  aggregateType: PropTypes.string,
  column: PropTypes.string,
  columns: PropTypes.array,
  filter: PropTypes.filter,
  firstGroup: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  groupColumn: PropTypes.string,
  maxGroups: PropTypes.string,
  name: PropTypes.string.isRequired,
  sortFields: PropTypes.array,
  sortOrders: PropTypes.array,
  sortStats: PropTypes.array,
  subgroupColumn: PropTypes.string,
  textColumns: PropTypes.array,
  type: PropTypes.string,
};

export default withGmp(DataSource);

// vim: set ts=2 sw=2 tw=80:
