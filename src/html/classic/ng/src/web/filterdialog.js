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

    filter.delete(sort_order);
    filter.set(value, sort_field);
    this.setState({sort_order: value, filter});
  }
}

FilterDialog.propTypes = {
  filter: React.PropTypes.object,
};


export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
