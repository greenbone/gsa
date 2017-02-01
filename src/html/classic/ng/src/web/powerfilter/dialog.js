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
import {is_defined, parse_int} from '../../utils.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import ApplyOverridesGroup from './applyoverridesgroup.js';
import FilterStringGroup from './filterstringgroup.js';
import FirstResultGroup from './firstresultgroup.js';
import MinQodGroup from './minqodgroup.js';
import ResultsPerPageGroup from './resultsperpagegroup.js';
import SortByGroup from './sortbygroup.js';

import Filter from '../../gmp/models/filter.js';

export class FilterDialog extends Dialog {

  constructor(...args) {
    super(...args);

    this.onFilterValueChange = this.onFilterValueChange.bind(this);
    this.onFilterIntValueChange = this.onFilterIntValueChange.bind(this);
    this.onFilterStringChange = this.onFilterStringChange.bind(this);
    this.onSortFieldChange = this.onSortFieldChange.bind(this);
    this.onSortOrderChange = this.onSortOrderChange.bind(this);
  }

  defaultState() {
    let state = super.defaultState();

    state.title = _('Update Filter');
    state.footer = _('Update');
    state.filter = undefined;
    state.filterstring = '';
    state.width = 800;

    return state;
  }

  show() {
    let {filter} = this.props;

    this.orig_filter = filter;

    filter = filter.copy();

    let sort_order = 'sort-reverse';
    let sort_field = filter.get(sort_order);

    if (!is_defined(sort_field)) {
      sort_order = 'sort';
      sort_field = filter.get(sort_order);
    }

    this.setState({
      visible: true,
      error: undefined,
      filter,
      filterstring: filter ? filter.toFilterCriteriaString() : '',
      sort_order,
      sort_field,
    });
  }

  save() {
    let {gmp} = this.context;
    let {filter, filterstring} = this.state;

    filter = Filter.fromString(filterstring, filter);

    this.close();

    if (filter.equals(this.orig_filter)) {
      filter = this.orig_filter;
    }

    return gmp.promise.resolve(filter);
  }

  getSortFields() {
    return this.props.sortFields;
  }

  onFilterIntValueChange(value, name) {
    value = parse_int(value);
    this.onFilterValueChange(value, name);
  }

  onFilterValueChange(value, name) {
    let {filter} = this.state;
    filter.set(name, value, '=');
    this.setState({filter});
  }

  onFilterStringChange(value) {
    this.setState({filterstring: value});
  }

  onSortFieldChange(value) {
    let {sort_order, filter} = this.state;

    filter.set(sort_order, value);
    this.setState({filter, sort_field: value});
  }

  onSortOrderChange(value) {
    let {sort_order, sort_field, filter} = this.state;

    if (sort_order === value) {
      return;
    }

    filter.set(value, sort_field);
    this.setState({sort_order: value, filter});
  }

  renderFilter() {
    let {filterstring} = this.state;
    return (
      <FilterStringGroup filter={filterstring}
        onChange={this.onFilterStringChange}/>
    );
  }

  renderApplyOverrides() {
    let {filter} = this.state;
    let apply_overrides = filter.get('apply_overrides');
    return (
      <ApplyOverridesGroup overrides={apply_overrides}
        onChange={this.onFilterValueChange}/>
    );
  }

  renderQoD() {
    let {filter} = this.state;
    return (
      <MinQodGroup filter={filter}
        onChange={this.onFilterValueChange}/>
    );
  }

  renderFirstResult() {
    let {filter} = this.state;
    let first = filter.get('first');
    return (
      <FirstResultGroup first={first}
        onChange={this.onFilterValueChange}/>
    );
  }

  renderResultsPerPage() {
    let {filter} = this.state;
    let rows = filter.get('rows');
    return (
      <ResultsPerPageGroup rows={rows}
        onChange={this.onFilterValueChange}/>
    );

  }

  renderSortBy() {
    let {sort_order, sort_field} = this.state;
    return (
      <SortByGroup
        fields={this.getSortFields()}
        by={sort_field}
        order={sort_order}
        onSortByChange={this.onSortFieldChange}
        onSortOrderChange={this.onSortOrderChange}/>
    );
  }

  /**
   * Default filter dialog form
   *
   * Override to specify different content
   *
   * @return Node default dialog content form
   */
  renderContent() {
    return (
      <Layout flex="column">
        {this.renderFilter()}
        {this.renderFirstResult()}
        {this.renderResultsPerPage()}
        {this.renderSortBy()}
      </Layout>
    );
  }
}

FilterDialog.propTypes = {
  filter: React.PropTypes.object,
  sortFields: React.PropTypes.array,
};

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
      });
    }

    show() {
      let {filter} = this.props;
      this.setFilter(filter);
      this.dialog.show();
    }

    handleSave() {
      let {filter} = this.state;

      if (filter.equals(this.orig_filter)) {
        filter = this.orig_filter;
      }

      if (this.props.onFilterUpdate) {
        this.props.onFilterUpdate(filter);
      }

      this.dialog.close();
    }

    onFilterValueChange(value, name, relation = '=') {
      let {filter} = this.state;
      filter.set(name, value, relation);
      this.setState({filter});
    }

    onFilterStringChange(value) {
      let {filter} = this.state;
      filter = Filter.fromString(value, filter);
      this.setState({filter});
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
      let {filter} = this.state;
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
              filter={filter}/>
          }
        </Dialog>
      );
    }
  };

  FilterDialogWrapper.propTypes = {
    visible: React.PropTypes.bool,
    ref: React.PropTypes.func,
    filter: React.PropTypes.object,
    onFilterUpdate: React.PropTypes.func,
  };

  return FilterDialogWrapper;
};


export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
