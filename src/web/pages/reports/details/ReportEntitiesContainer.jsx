/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import SortBy from 'web/components/sortby/SortBy';
import PropTypes from 'web/utils/PropTypes';

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
    const {counts = {}} = props;
    const {filtered} = counts;
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
    const {children, counts, entities, sortFunctions, sortReverse, sortField} =
      this.props;
    const {page} = this.state;

    if (!isDefined(children) || !isDefined(entities)) {
      return <Loading />;
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
    let pagedCounts;
    if (isDefined(counts)) {
      pagedCounts = counts.clone({
        first: entitiesIndex + 1,
        length: pagedEntities.length,
        rows,
      });
    } else {
      pagedCounts = {
        first: 1,
        length: 0,
        rows,
      };
    }

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
  counts: PropTypes.oneOfType([PropTypes.counts, PropTypes.object]).isRequired,
  entities: PropTypes.array,
  filter: PropTypes.filter,
  sortField: PropTypes.string.isRequired,
  sortFunctions: PropTypes.object,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default ReportEntitiesContainer;
