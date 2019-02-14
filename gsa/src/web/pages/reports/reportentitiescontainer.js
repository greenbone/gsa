/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SortBy from 'web/components/sortby/sortby';

const sortEntities = ({
  entities,
  sortFunctions = {},
  sortField,
  sortReverse,
}) => {
  const compareFunc = sortFunctions[sortField];

  if (!isDefined(compareFunc)) {
    return entities;
  }

  const compare = compareFunc(sortReverse);
  return [...entities].sort(compare);
};

const getRows = (filter, counts) => {
  let rows = isDefined(filter) ? filter.get('rows') : undefined;

  if (!isDefined(rows)) {
    rows = counts.rows;
  }
  return rows;
};

class ReportEntitiesContainer extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      entitiesIndex: 0,
      page: 0,
      sortReverse: false,
    };

    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const rows = getRows(props.filter, props.counts);
    const {filtered} = props.counts;
    const last = Math.floor(filtered / rows);

    if (state.page > last) {
      return {
        page: last,
      };
    }

    return null;
  }

  getRows() {
    const {filter, counts} = this.props;
    return getRows(filter, counts);
  }

  handleFirst() {
    this.handleInteraction();

    this.setState({page: 0});
  }

  handleLast() {
    const {counts} = this.props;

    const {filtered} = counts;
    const rows = this.getRows();

    const last = Math.floor((filtered - 1) / rows);

    this.handleInteraction();

    this.setState({
      page: last,
    });
  }

  handleNext() {
    const {page} = this.state;

    this.handleInteraction();

    this.setState({
      page: page + 1,
    });
  }

  handlePrevious() {
    const {page} = this.state;

    this.handleInteraction();

    this.setState({
      page: page - 1,
    });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      children,
      counts,
      entities,
      sortFunctions,
      sortReverse,
      sortField,
    } = this.props;
    const {page} = this.state;

    if (!isDefined(children) || !isDefined(entities)) {
      return null;
    }

    const sortedEntities = sortEntities({
      entities,
      sortFunctions,
      sortReverse,
      sortField,
    });

    const rows = this.getRows();
    const entitiesIndex = page * rows;
    const pagedEntities = sortedEntities.slice(
      entitiesIndex,
      entitiesIndex + rows,
    );
    const pagedCounts = counts.clone({
      first: entitiesIndex + 1,
      length: pagedEntities.length,
      rows,
    });

    return children({
      entities: pagedEntities,
      entitiesCounts: pagedCounts,
      sortBy: sortField,
      sortDir: sortReverse ? SortBy.DESC : SortBy.ASC,
      onFirstClick: this.handleFirst,
      onLastClick: this.handleLast,
      onNextClick: this.handleNext,
      onPreviousClick: this.handlePrevious,
    });
  }
}

ReportEntitiesContainer.propTypes = {
  children: PropTypes.func,
  counts: PropTypes.counts.isRequired,
  entities: PropTypes.array.isRequired,
  filter: PropTypes.filter,
  sortField: PropTypes.string.isRequired,
  sortFunctions: PropTypes.object,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default ReportEntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
