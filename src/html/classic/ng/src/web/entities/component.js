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

import {is_defined, log} from '../../utils.js';

import Filter from '../../gmp/models/filter.js';

export class EntitiesComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filters: [],
    };

    this.reload = this.reload.bind(this);
    this.onFirst = this.onFirst.bind(this);
    this.onLast = this.onLast.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.onFilterReset = this.onFilterReset.bind(this);
    this.onFilterUpdate = this.onFilterUpdate.bind(this);
    this.onFilterCreated = this.onFilterCreated.bind(this);
    this.onToggleOverrides = this.onToggleOverrides.bind(this);
  }

  componentDidMount() {
    let {gmp} = this.context;
    let filter_string = this.props.location.query.filter;
    let refresh = gmp.globals.autorefresh;
    let filter;

    if (filter_string) {
      filter = Filter.fromString(filter_string);
    }

    this.load(filter);
    this.loadFilters();

    if (refresh) {
      log.debug('Setting reload interval', refresh);
      this.timer = window.setInterval(this.reload, refresh * 1000);
    }
  }

  componentWillUnmount() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload interval');
      window.clearInterval(this.timer);
    }
  }

  reload() {
    this.load(this.state.filter);
  }

  onFirst() {
    let {filter} = this.state;

    this.load(filter.first());
  }

  onNext() {
    let {filter} = this.state;

    this.load(filter.next());
  }

  onPrevious() {
    let {filter} = this.state;

    this.load(filter.previous());
  }

  onLast() {
    let {filter} = this.state;
    let counts = this.getCounts();

    let last = Math.floor(counts.filtered / counts.rows) * counts.rows + 1;

    this.load(filter.first(last));
  }

  onFilterReset() {
    this.load();
  }

  onFilterUpdate(filter) {
    this.load(filter);
  }

  onFilterCreated(filter) {
    let {filters = []} = this.state;

    filters.push(filter);

    this.setState({filters});
  }

  onToggleOverrides() {
    let {filter} = this.state;
    let overrides = filter.get('apply_overrides');
    filter.set('apply_overrides', overrides ? 0 : 1, '=');

    this.load(filter);
  }

}

export default EntitiesComponent;

// vim: set ts=2 sw=2 tw=80:
