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

import {is_defined} from 'gmp/utils.js';

import CollectionList from 'gmp/collection/collectionlist.js';

import PropTypes from '../../utils/proptypes.js';

class ReportEntitiesContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
  }

  componentDidMount() {
    const {entities} = this.props;

    this.updateFromEntities(entities);
  }

  componentWillReceiveProps(next) {
    const {entities} = next;

    if (entities !== this.props.entities) {
      this.updateFromEntities(entities);
    }
  }

  updateFromEntities(entities) {
    const counts = entities.getCounts();

    this.load({
      entities,
      next_entity_index: counts.first - 1,
    });
  }

  load({entities, rows, next_entity_index} = {}) {
    const {
      entities: state_entities,
      current_entity_index,
    } = this.state;

    const index = is_defined(next_entity_index) ? next_entity_index :
      current_entity_index;

    if (!is_defined(entities)) {
      entities = state_entities;
    }

    const filter = entities.getFilter();
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
    const {children} = this.props;
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
    });
  }
}

ReportEntitiesContainer.propTypes = {
  children: PropTypes.func,
  entities: PropTypes.collection.isRequired,
};

export default ReportEntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
