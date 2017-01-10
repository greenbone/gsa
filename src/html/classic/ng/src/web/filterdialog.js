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

import  _ from '../locale.js';
import {is_defined} from '../utils.js';

import Dialog from './dialog.js';

import FormGroup from './form/formgroup.js';
import FormItem from './form/formitem.js';
import YesNoRadio from './form/yesnoradio.js';
import Spinner from './form/spinner.js';
import Select2 from './form/select2.js';
import TextField from './form/textfield.js';
import Radio from './form/radio.js';

import Filter from '../gmp/models/filter.js';

export class FilterDialog extends Dialog {

  constructor(...args) {
    super(...args);

    this.onFilterValueChange = this.onFilterValueChange.bind(this);
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
      <FormGroup title={_('Filter')} flex>
        <TextField
          value={filterstring} size="30"
          onChange={this.onFilterStringChange}
          maxLength="80"/>
      </FormGroup>
    );
  }

  renderApplyOverrides() {
    let {filter} = this.state;
    let apply_overrides = filter.get('apply_overrides');
    return (
      <FormGroup title={_('Apply Overrides')} flex>
        <YesNoRadio
          value={apply_overrides}
          name="apply_overrides"
          onChange={this.onFilterValueChange}/>
      </FormGroup>
    );
  }

  renderQoD() {
    let {filter} = this.state;
    let min_qod = filter.get('min_qod');
    return (
      <FormGroup title={_('QoD')} flex>
        <FormItem>
          {_('must be at least')}
        </FormItem>
        <FormItem>
          <Spinner
            type="int"
            name="min_qod"
            min="0" max="100"
            step="1"
            value={min_qod}
            size="1"
            onChange={this.onFilterValueChange}/>
        </FormItem>
      </FormGroup>
    );
  }

  renderFirstResult() {
    let {filter} = this.state;
    let first = filter.get('first');
    return (
      <FormGroup title={_('First result')} flex>
        <Spinner type="int" name="first"
          value={first}
          size="5"
          onChange={this.onFilterValueChange}/>
      </FormGroup>
    );
  }

  renderResultsPerPage() {
    let {filter} = this.state;
    let rows = filter.get('rows');
    return (
      <FormGroup title={_('Results per page')} flex>
        <Spinner type="int" name="rows"
          value={rows}
          size="5"
          onChange={this.onFilterValueChange}/>
      </FormGroup>
    );

  }

  renderSortBy() {
    let {sort_order, sort_field} = this.state;
    return (
      <FormGroup title={_('Sort by')} flex>
        <FormItem>
          <Select2
            name="sort_field"
            value={sort_field}
            onChange={this.onSortFieldChange}>
            {this.renderSortFieldOptions()}
          </Select2>
        </FormItem>
        <FormItem>
          <Radio
            className="inline"
            name="sort_order"
            value="sort"
            checked={sort_order === 'sort'}
            title={_('Ascending')}
            onChange={this.onSortOrderChange}/>
          <Radio
            className="inline"
            name="sort_order"
            value="sort-reverse"
            checked={sort_order === 'sort-reverse'}
            title={_('Descending')}
            onChange={this.onSortOrderChange}/>
        </FormItem>
      </FormGroup>
    );
  }
}

FilterDialog.propTypes = {
  filter: React.PropTypes.object,
};


export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
