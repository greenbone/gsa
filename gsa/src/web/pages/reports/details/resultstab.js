/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import Filter from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';

import {isDefined, hasValue} from 'gmp/utils/identity';

import ErrorPanel from 'web/components/error/errorpanel';

import Loading from 'web/components/loading/loading';
import Reload, {
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
  NO_RELOAD,
} from 'web/components/loading/reload';

import SortBy from 'web/components/sortby/sortby';

import ResultsTable from 'web/pages/results/table';

import {
  loadEntities as loadResults,
  selector as resultsSelector,
} from 'web/store/entities/results';

import {pageFilter} from 'web/store/pages/actions';
import getPage from 'web/store/pages/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EmptyReport from './emptyreport';
import EmptyResultsReport from './emptyresultsreport';

const filterWithReportId = (filter, reportId) =>
  isDefined(filter)
    ? filter.copy().set('_and_report_id', reportId)
    : Filter.fromString(`_and_report_id=${reportId}`);

class ResultsTab extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {isUpdating: false};

    this.handleFirstClick = this.handleFirstClick.bind(this);
    this.handleLastClick = this.handleLastClick.bind(this);
    this.handlePreviousClick = this.handlePreviousClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);

    this.handleSortChange = this.handleSortChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (isDefined(props.results)) {
      // update only if new results are available to avoid having no results
      // when the filter changes
      return {
        results: props.results,
        resultsCounts: props.resultsCounts,
        isUpdating: false,
      };
    }
    // results are not in the store and are currently loaded
    return {
      isUpdating: true,
    };
  }

  componentDidUpdate(prevProps) {
    const {reportFilter} = this.props;

    if (
      isDefined(prevProps.reportFilter) &&
      !prevProps.reportFilter.equals(reportFilter)
    ) {
      this.load(reportFilter);
    }
  }

  load(filter) {
    this.setState({isUpdating: true});

    this.props
      .reload(filter)
      .then(() => {
        this.setState({isUpdating: false});
      })
      .catch(() => {
        this.setState({isUpdating: false});
      });
  }

  handleFirstClick() {
    const {resultsFilter: filter} = this.props;

    this.load(filter.first());
  }

  handleNextClick() {
    const {resultsFilter: filter} = this.props;

    this.load(filter.next());
  }

  handlePreviousClick() {
    const {resultsFilter: filter} = this.props;

    this.load(filter.previous());
  }

  handleLastClick() {
    const {resultsFilter: filter, resultsCounts: counts} = this.props;

    const last =
      Math.floor((counts.filtered - 1) / counts.rows) * counts.rows + 1;

    this.load(filter.first(last));
  }

  handleSortChange(field) {
    const {resultsFilter: filter} = this.props;

    let sort = 'sort';
    const sortField = filter.getSortBy();

    const newFilter = filter.first();

    if (sortField && sortField === field) {
      sort = newFilter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    newFilter.set(sort, field);

    this.load(newFilter);
  }

  render() {
    const {isUpdating, results, resultsCounts} = this.state;
    const {
      hasTarget,
      isLoading = true,
      progress,
      reportFilter,
      reportId,
      reportResultsCounts,
      resultsError,
      resultsFilter,
      status,
      onFilterAddLogLevelClick,
      onFilterDecreaseMinQoDClick,
      onFilterEditClick,
      onFilterRemoveClick,
      onFilterRemoveSeverityClick,
      onTargetEditClick,
    } = this.props;

    if (isDefined(resultsError)) {
      return (
        <ErrorPanel
          message={_('Error while loading Results for Report {{reportId}}', {
            reportId,
          })}
          error={resultsError}
        />
      );
    }

    const reverseField = isDefined(resultsFilter)
      ? resultsFilter.get('sort-reverse')
      : undefined;
    const reverse = isDefined(reverseField);
    let sortBy =
      reverse || !isDefined(resultsFilter)
        ? reverseField
        : resultsFilter.get('sort');
    const sortDir = reverse ? SortBy.DESC : SortBy.ASC;

    if (!isDefined(sortBy)) {
      // sort by severity by default
      sortBy = 'severity';
    }

    if (!isDefined(resultsError) && !isDefined(results) && isLoading) {
      return <Loading />;
    }

    const displayedFilter = isDefined(resultsFilter)
      ? resultsFilter.copy().delete('_and_report_id')
      : reportFilter;

    if (reportResultsCounts?.filtered === 0) {
      if (reportResultsCounts.all === 0) {
        return (
          <EmptyReport
            hasTarget={hasTarget}
            status={status}
            progress={progress}
            onTargetEditClick={onTargetEditClick}
          />
        );
      } else if (reportResultsCounts.all > 0) {
        return (
          <EmptyResultsReport
            all={reportResultsCounts.all}
            filter={displayedFilter}
            onFilterAddLogLevelClick={onFilterAddLogLevelClick}
            onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
            onFilterEditClick={onFilterEditClick}
            onFilterRemoveClick={onFilterRemoveClick}
            onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
          />
        );
      }
    }
    return (
      <ResultsTable
        delta={false}
        entities={results}
        entitiesCounts={resultsCounts}
        filter={displayedFilter}
        footer={false}
        isUpdating={isUpdating}
        links={true}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleDetailsIcon={false}
        onFirstClick={this.handleFirstClick}
        onLastClick={this.handleLastClick}
        onPreviousClick={this.handlePreviousClick}
        onNextClick={this.handleNextClick}
        onSortChange={this.handleSortChange}
      />
    );
  }
}

ResultsTab.propTypes = {
  hasTarget: PropTypes.bool,
  isLoading: PropTypes.bool,
  progress: PropTypes.number.isRequired,
  reload: PropTypes.func.isRequired,
  reportFilter: PropTypes.filter.isRequired,
  reportId: PropTypes.id.isRequired,
  reportResultsCounts: PropTypes.counts,
  results: PropTypes.array,
  resultsCounts: PropTypes.counts,
  resultsError: PropTypes.error,
  resultsFilter: PropTypes.filter,
  status: PropTypes.string.isRequired,
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

const reloadInterval = status =>
  isActive(status) ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE : NO_RELOAD; // report doesn't change anymore. no need to reload

const loadInitial = ({
  reportFilter,
  reportId,
  resultsFilter,
  // eslint-disable-next-line no-shadow
  loadResults,
  updateFilter,
}) => () => {
  let newFilter = resultsFilter;

  if (isDefined(resultsFilter) && isDefined(reportFilter)) {
    const simplifiedResultsFilter = resultsFilter
      .copy()
      .delete(resultsFilter.getSortOrder())
      .delete('first')
      .delete('_and_report_id');
    const simplifiedReportFilter = reportFilter
      .copy()
      .delete(reportFilter.getSortOrder())
      .delete('first');

    if (!simplifiedReportFilter.equals(simplifiedResultsFilter)) {
      // report filter has changed
      newFilter = reportFilter;
    }
  } else if (isDefined(resultsFilter)) {
    newFilter = resultsFilter;
  } else {
    newFilter = reportFilter;
  }

  newFilter = filterWithReportId(newFilter, reportId);
  updateFilter(newFilter);

  return loadResults(newFilter);
};

const load = ({
  reportFilter,
  reportId,
  resultsFilter,
  // eslint-disable-next-line no-shadow
  loadResults,
  updateFilter,
}) => newFilter => {
  if (!hasValue(newFilter)) {
    newFilter = resultsFilter;
  }

  if (!hasValue(newFilter)) {
    newFilter = reportFilter;
  }

  newFilter = filterWithReportId(newFilter, reportId);
  updateFilter(newFilter);

  return loadResults(newFilter);
};

const ResultsTabWrapper = props => (
  <Reload
    name={`report-${props.reportId}-results`}
    load={loadInitial(props)}
    reload={load(props)}
    reloadInterval={() => reloadInterval(props.status)}
  >
    {({reload}) => <ResultsTab {...props} reload={reload} />}
  </Reload>
);

ResultsTabWrapper.propTypes = {
  reportId: PropTypes.id.isRequired,
  status: PropTypes.string.isRequired,
};

const getPageName = reportId => `report-${reportId}-results`;

const mapStateToProps = (state, {reportId}) => {
  const name = getPageName(reportId);
  const pSelector = getPage(state);
  const resultsFilter = pSelector.getFilter(name);
  const selector = resultsSelector(state);
  return {
    resultsFilter,
    resultsError: selector.getEntitiesError(resultsFilter),
    results: selector.getEntities(resultsFilter),
    resultsCounts: selector.getEntitiesCounts(resultsFilter),
    isLoading: selector.isLoadingEntities(resultsFilter),
  };
};

const mapDispatchToProps = (dispatch, {reportId, gmp}) => {
  const name = getPageName(reportId);
  return {
    loadResults: f => dispatch(loadResults(gmp)(f)),
    updateFilter: f => dispatch(pageFilter(name, f)),
  };
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(ResultsTabWrapper);

// vim: set ts=2 sw=2 tw=80:
