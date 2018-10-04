/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import React from 'react';

import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import Filter, {RESET_FILTER, RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import withDownload from 'web/components/form/withDownload';

import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import {
  loadEntities as loadFilters,
  selector as filterSelector,
} from 'web/store/entities/filters';

import {
  loadEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';

import {
  loadDeltaReport,
  deltaSelector,
  loadEntity as loadReport,
  selector as reportSelector,
} from 'web/store/entities/reports';

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import {create_pem_certificate} from 'web/utils/cert';
import {
  DEFAULT_RELOAD_INTERVAL_ACTIVE,
  LOAD_TIME_FACTOR,
} from 'web/utils/constants';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import TargetComponent from '../targets/component';

import Page from './detailscontent';
import FilterDialog from './detailsfilterdialog';

const log = logger.getLogger('web.pages.report.detailspage');

const DEFAULT_FILTER = Filter.fromString('rows=100');

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 trust=1 rows=-1');

const getTarget = (entity = {}) => {
  const {report = {}} = entity;
  const {task = {}} = report;
  return task.target;
};

const getFilter = (entity = {}) => {
  const {report = {}} = entity;
  return report.filter;
};

class ReportDetails extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      activeTab: 1,
      showFilterDialog: false,
      sorting: {
        results: {
          sortField: 'created',
          sortReverse: true,
        },
        apps: {
          sortField: 'severity',
          sortReverse: true,
        },
        ports: {
          sortField: 'severity',
          sortReverse: true,
        },
        hosts: {
          sortField: 'severity',
          sortReverse: true,
        },
        os: {
          sortField: 'severity',
          sortReverse: true,
        },
        cves: {
          sortField: 'severity',
          sortReverse: true,
        },
        closedcves: {
          sortField: 'severity',
          sortReverse: true,
        },
        tlscerts: {
          sortField: 'dn',
          sortReverse: false,
        },
        errors: {
          sortField: 'error',
          sortReverse: false,
        },
      },
    };

    this.handleActivateTab = this.handleActivateTab.bind(this);
    this.handleAddToAssets = this.handleAddToAssets.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleFilterAddLogLevel = this.handleFilterAddLogLevel.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterDecreaseMinQoD =
      this.handleFilterDecreaseMinQoD.bind(this);
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterRemoveSeverity =
      this.handleFilterRemoveSeverity.bind(this);
    this.handleFilterRemoveClick = this.handleFilterRemoveClick.bind(this);
    this.handleFilterResetClick = this.handleFilterResetClick.bind(this);
    this.handleRemoveFromAssets = this.handleRemoveFromAssets.bind(this);
    this.handleReportDownload = this.handleReportDownload.bind(this);
    this.handleReportFormatChange = this.handleReportFormatChange.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleTlsCertificateDownload = this.handleTlsCertificateDownload
      .bind(this);
    this.handleFilterDialogClose = this.handleFilterDialogClose.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);

    this.loadTarget = this.loadTarget.bind(this);
  }

  componentDidMount() {
    this.isRunning = true;
    const {filter: filterString} = this.props.location.query;

    const filter = isDefined(filterString) ?
      Filter.fromString(filterString) : undefined;

    this.load(filter);
    this.loadFilters();
    this.loadReportFormats();
  }

  componentWillUnmount() {
    this.isRunning = false;

    this.clearTimer();
  }

  componentDidUpdate() {
    const {reportFormats} = this.props;
    if (!isDefined(this.state.reportFormatId) && isDefined(reportFormats)) {
      // set initial report format id
      this.setState({reportFormatId: first(reportFormats).id});
    }

    if (this.state.reportId !== this.props.reportId ||
      this.state.deltaReportId !== this.props.deltaReportId) {
      this.load();
    }
  }

  startDurationMeasurement() {
    this.startTimeStamp = performance.now();
  }

  endDurationMeasurement() {
    if (!isDefined(this.startTimeStamp)) {
      return 0;
    }

    const duration = performance.now() - this.startTimeStamp;
    this.startTimeStamp = undefined;
    return duration;
  }

  load(filter = this.props.filter) {
    const {reportId, deltaReportId} = this.props;

    if (!isDefined(filter)) {
      filter = DEFAULT_FILTER;
    }

    log.debug('Loading report', {
      reportId,
      deltaReportId,
      filter,
    });

    this.startDurationMeasurement();

    this.setState({reportId, deltaReportId});

    this.props.loadReport(reportId, deltaReportId, filter)
      .then(() => this.startTimer());
  }

  loadReportFormats() {
    this.props.loadReportFormats();
  }

  loadFilters() {
    this.props.loadFilters();
  }

  reload() {
    // reload data from backend
    this.load();
  }

  getReloadInterval() {
    const {entity} = this.props;
    return isActive(entity.report.scan_run_status) ?
      DEFAULT_RELOAD_INTERVAL_ACTIVE :
      0; // report doesn't change anymore. no need to reload
  }

  startTimer() {
    if (!this.isRunning) {
      return;
    }

    const loadTime = this.endDurationMeasurement();

    log.debug('Loading time was', loadTime, 'milliseconds');

    let interval = this.getReloadInterval();

    if (loadTime > interval && interval !== 0) {
      // ensure timer is longer then the loading procedure
      interval = loadTime * LOAD_TIME_FACTOR;
    }

    if (interval > 0) {
      this.timer = global.setTimeout(this.handleTimer, interval);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        interval, 'milliseconds');
    }
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      global.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  handleChanged() {
    this.reload();
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  handleFilterChange(filter) {
    this.handleInteraction();

    this.load(filter);
  }

  handleFilterRemoveClick() {
    this.handleFilterChange(RESET_FILTER);
  }

  handleFilterResetClick() {
    this.handleFilterChange(Filter.fromString(''));
  }

  handleActivateTab(index) {
    this.handleInteraction();

    this.setState({activeTab: index});
  }

  handleReportFormatChange(value) {
    this.setState({reportFormatId: value});
  }

  handleAddToAssets() {
    const {gmp, showSuccessMessage} = this.props;
    const {entity, filter} = this.state;

    this.handleInteraction();

    gmp.report.addAssets(entity, {filter}).then(response => {
      showSuccessMessage(
        _('Report content added to Assets with QoD>=70% and Overrides enabled.')
      );
    }, this.handleError);
  }

  handleRemoveFromAssets() {
    const {gmp, showSuccessMessage} = this.props;
    const {entity, filter} = this.state;

    this.handleInteraction();

    gmp.report.removeAssets(entity, {filter}).then(response => {
      showSuccessMessage(
        _('Report content removed from Assets.')
      );
    }, this.handleError);
  }

  handleFilterEditClick() {
    this.handleInteraction();

    this.setState({showFilterDialog: true});
  }

  handleFilterDialogClose() {
    this.handleInteraction();

    this.setState({showFilterDialog: false});
  }

  handleReportDownload() {
    const {
      deltaReportId,
      entity,
      filter,
      gmp,
      reportFormats = [],
      onDownload,
    } = this.props;
    const {
      reportFormatId,
    } = this.state;

    const report_format = reportFormats.find(
      format => reportFormatId === format.id);

    const extension = isDefined(report_format) ? report_format.extension :
      'unknown'; // unknown should never happen but we should be save here

    this.handleInteraction();

    gmp.report.download(entity, {
      reportFormatId,
      deltaReportId,
      filter,
    }).then(response => {
      const {data} = response;
      const filename = 'report-' + entity.id + '.' + extension;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleTlsCertificateDownload(cert) {
    const {onDownload} = this.props;

    const {data, serial} = cert;

    this.handleInteraction();

    onDownload({
      filename: 'tls-cert-' + serial + '.pem',
      data: create_pem_certificate(data),
    });
  }

  handleFilterCreated(filter) {
    this.handleInteraction();

    this.load(filter);
    this.loadFilters();
  }

  handleFilterAddLogLevel() {
    const {filter} = this.props;
    let levels = filter.get('levels', '');

    this.handleInteraction();

    if (!levels.includes('g')) {
      levels += 'g';
      const lfilter = filter.copy();
      lfilter.set('levels', levels);
      this.load(lfilter);
    }
  }

  handleFilterRemoveSeverity() {
    const {filter} = this.props;

    this.handleInteraction();

    if (filter.has('severity')) {
      const lfilter = filter.copy();
      lfilter.delete('severity');
      this.load(lfilter);
    }
  }

  handleFilterDecreaseMinQoD() {
    const {filter} = this.props;

    this.handleInteraction();

    if (filter.has('min_qod')) {
      const lfilter = filter.copy();
      lfilter.set('min_qod', 30);
      this.load(lfilter);
    }
  }

  handleSortChange(name, sortField) {
    this.handleInteraction();

    const prev = this.state.sorting[name];

    const sortReverse = sortField === prev.sortField ?
      !prev.sortReverse : false;

    this.setState({
      sorting: {
        ...this.state.sorting,
        [name]: {
          sortField,
          sortReverse,
        },
      },
    });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  loadTarget() {
    const {entity} = this.props;
    const target = getTarget(entity);

    return this.props.loadTarget(target.id);
  }

  render() {
    const {
      entity,
      filter,
      filters = [],
      isLoading,
      reportFormats,
      onInteraction,
      showError,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;
    const {
      activeTab,
      reportFormatId,
      showFilterDialog,
      sorting,
    } = this.state;

    const {report} = entity || {};
    return (
      <React.Fragment>
        <TargetComponent
          onError={this.handleError}
          onInteraction={onInteraction}
        >
          {({edit}) => (
            <Page
              activeTab={activeTab}
              entity={entity}
              filter={filter}
              filters={filters}
              isLoading={isLoading}
              reportFormatId={reportFormatId}
              reportFormats={reportFormats}
              sorting={sorting}
              onActivateTab={this.handleActivateTab}
              onAddToAssetsClick={this.handleAddToAssets}
              onError={this.handleError}
              onFilterAddLogLevelClick={this.handleFilterAddLogLevel}
              onFilterDecreaseMinQoDClick={this.handleFilterDecreaseMinQoD}
              onFilterChanged={this.handleFilterChange}
              onFilterCreated={this.handleFilterCreated}
              onFilterEditClick={this.handleFilterEditClick}
              onFilterRemoveSeverityClick={this.handleFilterRemoveSeverity}
              onFilterResetClick={this.handleFilterResetClick}
              onFilterRemoveClick={this.handleFilterRemoveClick}
              onInteraction={onInteraction}
              onRemoveFromAssetsClick={this.handleRemoveFromAssets}
              onReportDownloadClick={this.handleReportDownload}
              onReportFormatChange={this.handleReportFormatChange}
              onSortChange={this.handleSortChange}
              onTagSuccess={this.handleChanged}
              onTargetEditClick={() => this.loadTarget()
                .then(response => edit(response.data))}
              onTlsCertificateDownloadClick={this.handleTlsCertificateDownload}
              showError={showError}
              showErrorMessage={showErrorMessage}
              showSuccessMessage={showSuccessMessage}
            />
          )}
        </TargetComponent>
        {showFilterDialog &&
          <FilterDialog
            filter={filter}
            delta={isDefined(report) && report.isDeltaReport()}
            onFilterChanged={this.handleFilterChange}
            onCloseClick={this.handleFilterDialogClose}
          />
        }
      </React.Fragment>
    );
  }
}

ReportDetails.propTypes = {
  deltaReportId: PropTypes.id,
  entity: PropTypes.model,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadFilters: PropTypes.func.isRequired,
  loadReport: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadTarget: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  reportFormats: PropTypes.array,
  reportId: PropTypes.id,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  target: PropTypes.model,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
    loadFilters: () => dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER)),
    loadTarget: targetId => gmp.target.get({id: targetId}),
    loadReportFormats: () => dispatch(
      loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
    loadReport: (id, deltaId, filter) => dispatch(isDefined(deltaId) ?
      loadDeltaReport(gmp)(id, deltaId, filter) :
      loadReport(gmp)(id, filter)),
  };
};

const mapStateToProps = (rootState, {match}) => {
  const {id, deltaid} = match.params;
  const filterSel = filterSelector(rootState);
  const reportSel = reportSelector(rootState);
  const deltaSel = deltaSelector(rootState);
  const reportFormatsSel = reportFormatsSelector(rootState);

  const entity = isDefined(deltaid) ? deltaSel.getEntity(id, deltaid) :
    reportSel.getEntity(id);
  return {
    entity,
    filter: getFilter(entity),
    isLoading: !isDefined(entity),
    filters: filterSel.getEntities(RESULTS_FILTER_FILTER),
    reportFormats: reportFormatsSel.getEntities(REPORT_FORMATS_FILTER),
    reportId: id,
    deltaReportId: deltaid,
  };
};

export default compose(
  withRouter,
  withGmp,
  withDialogNotification,
  withDownload,
  connect(mapStateToProps, mapDispatchToProps),
)(ReportDetails);

// vim: set ts=2 sw=2 tw=80:
