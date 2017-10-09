/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from 'gmp/log.js';

import {is_defined} from 'gmp/utils.js';

import CollectionList from 'gmp/collection/collectionlist.js';

import PropTypes from '../../utils/proptypes.js';

const log = logger.getLogger('web.pages.reports.reportentitiescontainer');

class ReportEntitiesContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  componentDidMount() {
    const {entities, filter} = this.props;

    this.updateFromEntities(entities, filter);
  }

  componentWillReceiveProps(next) {
    const {entities, filter} = next;

    if (entities !== this.props.entities ||
      (is_defined(filter) && !filter.equals(this.props.filter))) {
      this.updateFromEntities(entities, filter);
    }
  }

  updateFromEntities(entities, filter) {
    const {
      sort: state_sort,
    } = this.state;

    const counts = entities.getCounts();
    filter = is_defined(filter) ? filter : entities.getFilter();

    const reverse_field = filter.get('sort-reverse');
    const reverse = is_defined(reverse_field);
    const field = reverse ? reverse_field : filter.get('sort');

    // only goto first page if sorting has changed
    const next = !is_defined(state_sort) || state_sort.reverse !== reverse ||
      state_sort.field !== field ? counts.first - 1 : undefined;

    const sort = {
      reverse,
      field,
    };

    this.load({
      entities,
      filter,
      next_entity_index: next,
      sort,
    });
  }

  load({entities, filter, rows, sort, next_entity_index} = {}) {
    const {
      entities: state_entities,
      current_entity_index,
      sort: state_sort,
      filter: state_filter,
    } = this.state;

    const index = is_defined(next_entity_index) ? next_entity_index :
      current_entity_index;

    if (!is_defined(entities)) {
      entities = state_entities;
    }

    if (!is_defined(sort)) {
      sort = state_sort;
    }

    if (!is_defined(filter)) {
      filter = state_filter;
    }

    const counts = entities.getCounts();
    let entries = entities.getEntries();

    if (!is_defined(rows)) {
      rows = filter.get('rows');

      if (!is_defined(rows)) {
        rows = counts.rows;
      }
    }

    entries = entries.slice(index, index + rows);

    const paged = new CollectionList({
      entries,
      filter,
      counts: counts.clone({
        first: index + 1,
        length: entries.length,
        rows,
      }),
    });


    this.setState({
      current_entity_index: index,
      displayed_entity_rows: rows,
      entities,
      paged_entities: paged,
      filter,
      sort,
    });
  }

  handleSortChange(field) {
    const {
      entities,
      sort: old_sort,
    } = this.state;

    const {sortFunctions = {}} = this.props;

    const new_sort = {
      field,
      reverse: field === old_sort.field ? !old_sort.reverse : false,
    };

    const compare_func = sortFunctions[field];

    if (!is_defined(compare_func)) {
      // ensure not to crash if a compare function hasn't be defined yet
      log.error('Missing compare function for column', field);
      return;
    }

    const compare = compare_func(new_sort.reverse);

    this.load({
      entities: entities.sort(compare),
      sort: new_sort,
    });
  }

  handleFirst() {
    this.load({next_entity_index: 0});
  }

  handleLast() {
    const {
      entities,
      displayed_entity_rows: rows,
    } = this.state;

    const counts = entities.getCounts();
    const {filtered} = counts;

    const last = Math.floor((filtered - 1) / rows) * rows + 1;

    this.load({next_entity_index: last});
  }

  handleNext() {
    const {
      current_entity_index,
      displayed_entity_rows: rows,
    } = this.state;

    this.load({
      next_entity_index: current_entity_index + rows,
    });
  }

  handlePrevious() {
    const {
      current_entity_index,
      displayed_entity_rows: rows,
    } = this.state;

    this.load({
      next_entity_index: current_entity_index - rows,
    });
  }

  render() {
    const {children, sortFunctions} = this.props;
    const {paged_entities: entities, filter} = this.state;

    if (!is_defined(children)) {
      return null;
    }

    return children({
      entities,
      filter,
      onFirstClick: this.handleFirst,
      onLastClick: this.handleLast,
      onNextClick: this.handleNext,
      onPreviousClick: this.handlePrevious,
      onSortChange: is_defined(sortFunctions) ? this.handleSortChange :
        undefined,
    });
  }
}

ReportEntitiesContainer.propTypes = {
  children: PropTypes.func,
  entities: PropTypes.collection.isRequired,
  filter: PropTypes.filter,
  sortFunctions: PropTypes.object,
};

export default ReportEntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
