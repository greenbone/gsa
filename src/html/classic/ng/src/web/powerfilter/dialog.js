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
import {is_defined} from '../../utils.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import FilterStringGroup from './filterstringgroup.js';
import FirstResultGroup from './firstresultgroup.js';
import ResultsPerPageGroup from './resultsperpagegroup.js';
import SortByGroup from './sortbygroup.js';

import Filter from '../../gmp/models/filter.js';

const DefaultFilterDialogComponent = props => {

  let {filter, filterstring, sortFields, onFilterStringChange,
    onFilterValueChange, onSortByChange, onSortOrderChange} = props;
  return (
    <Layout flex="column">
      <FilterStringGroup
        filter={filterstring}
        onChange={onFilterStringChange}/>
      <FirstResultGroup
        filter={filter}
        onChange={onFilterValueChange}/>
      <ResultsPerPageGroup filter={filter}
        onChange={onFilterValueChange}/>
      <SortByGroup
        fields={sortFields}
        filter={filter}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}/>
    </Layout>
  );
};

export const DefaultFilterDialogPropTypes = {
  filter: React.PropTypes.object,
  filterstring: React.PropTypes.string,
  sortFields: React.PropTypes.array,
  onSortByChange: React.PropTypes.func,
  onSortOrderChange: React.PropTypes.func,
  onFilterValueChange: React.PropTypes.func,
  onFilterStringChange: React.PropTypes.func,
};

DefaultFilterDialogComponent.propTypes = DefaultFilterDialogPropTypes;

export const withFilterDialog = FilterDialogComponent => {
  class FilterDialogWrapper extends React.Component {
    constructor(...args) {
      super(...args);

      this.state = {};

      this.setFilter(this.props.filter);

      this.handleSave = this.handleSave.bind(this);
      this.onFilterValueChange = this.onFilterValueChange.bind(this);
      this.onFilterStringChange = this.onFilterStringChange.bind(this);
      this.onSortByChange = this.onSortByChange.bind(this);
      this.onSortOrderChange = this.onSortOrderChange.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
    }

    setFilter(filter) {
      if (!is_defined(filter)) {
        return;
      }

      this.orig_filter = filter;

      this.setState({
        filter: filter.copy(),
        filterstring: filter.toFilterCriteriaString(),
      });
    }

    show() {
      let {filter} = this.props;
      this.setFilter(filter);
      this.dialog.show();
    }

    handleSave() {
      let {filter, filterstring} = this.state;

      filter = Filter.fromString(filterstring, filter);

      if (this.props.onFilterChanged && !filter.equals(this.orig_filter)) {
        this.props.onFilterChanged(filter);
      }

      this.dialog.close();
    }

    onFilterValueChange(value, name, relation = '=') {
      let {filter} = this.state;
      filter.set(name, value, relation);
      this.setState({filter});
    }

    onFilterStringChange(value) {
      this.setState({filterstring: value});
    }

    onValueChange(value, name) {
      this.setState({[name]: value});
    }

    onSortByChange(value) {
      let {filter} = this.state;

      filter.setSortBy(value);
      this.setState({filter});
    }

    onSortOrderChange(value) {
      let {filter} = this.state;
      filter.setSortOrder(value);
      this.setState({filter});
    }

    render() {
      let {filter, filterstring} = this.state;
      return (
        <Dialog
          ref={ref => this.dialog = ref}
          title={_('Update Filter')}
          footer={_('Update')}
          width={800}
          onSaveClick={this.handleSave}>
          {filter &&
            <FilterDialogComponent {...this.props}
              onFilterValueChange={this.onFilterValueChange}
              onFilterStringChange={this.onFilterStringChange}
              onSortOrderChange={this.onSortOrderChange}
              onSortByChange={this.onSortByChange}
              onValueChange={this.onValueChange}
              filterstring={filterstring}
              filter={filter}/>
          }
        </Dialog>
      );
    }
  };

  FilterDialogWrapper.propTypes = {
    filter: React.PropTypes.object,
    onFilterChanged: React.PropTypes.func,
  };

  return FilterDialogWrapper;
};

export const FilterDialog = withFilterDialog(DefaultFilterDialogComponent);

export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
