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

import logger from 'gmp/log';

import Filter, {RESET_FILTER, RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';

import {first} from 'gmp/utils/array';
import {isDefined, hasValue} from 'gmp/utils/identity';

import withDownload from 'web/components/form/withDownload';

import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import FilterProvider from 'web/entities/filterprovider';

import DownloadReportDialog from 'web/pages/reports/downloadreportdialog';

import {
  loadAllEntities as loadFilters,
  selector as filterSelector,
} from 'web/store/entities/filters';

import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';

import {loadReportWithThreshold} from 'web/store/entities/report/actions';
import {reportSelector} from 'web/store/entities/report/selectors';

import {
  loadReportComposerDefaults,
  renewSessionTimeout,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import {
  getReportComposerDefaults,
  getUsername,
} from 'web/store/usersettings/selectors';

import {create_pem_certificate} from 'web/utils/cert';
import compose from 'web/utils/compose';
import {generateFilename} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import TargetComponent from '../targets/component';
import PageTitle from 'web/components/layout/pagetitle';

import Page from './detailscontent';
import FilterDialog from './detailsfilterdialog';
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
import getPage from 'web/store/pages/selectors';

const log = logger.getLogger('web.pages.report.detailspage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity',
);

export const REPORT_RESET_FILTER = RESET_FILTER.copy()
  .setSortOrder('sort-reverse')
  .setSortBy('severity');

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

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
      activeTab: 0,
      showFilterDialog: false,
      showDownloadReportDialog: false,
      sorting: {
        results: {
          sortField: 'severity',
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
    this.handleFilterDecreaseMinQoD = this.handleFilterDecreaseMinQoD.bind(
      this,
    );
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterRemoveSeverity = this.handleFilterRemoveSeverity.bind(
      this,
    );
    this.handleFilterRemoveClick = this.handleFilterRemoveClick.bind(this);
    this.handleFilterResetClick = this.handleFilterResetClick.bind(this);
    this.handleRemoveFromAssets = this.handleRemoveFromAssets.bind(this);
    this.handleReportDownload = this.handleReportDownload.bind(this);
    this.handleTlsCertificateDownload = this.handleTlsCertificateDownload.bind(
      this,
    );
    this.handleFilterDialogClose = this.handleFilterDialogClose.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);

    this.loadTarget = this.loadTarget.bind(this);
    this.handleOpenDownloadReportDialog = this.handleOpenDownloadReportDialog.bind(
      this,
    );
    this.handleCloseDownloadReportDialog = this.handleCloseDownloadReportDialog.bind(
      this,
    );
  }

  static getDerivedStateFromProps(props, state) {
    if (isDefined(props.entity)) {
      // update only if a new report is available to avoid having no report
      // when the filter changes
      const {report = {}} = props.entity;
      const {
        results = {},
        hosts = {},
        ports = {},
        applications = {},
        operatingsystems = {},
        cves = {},
        closedCves = {},
        tlsCertificates = {},
        errors = {},
      } = report;

      return {
        entity: props.entity,

        resultsCounts: isDefined(results.counts)
          ? results.counts
          : state.resultsCounts,
        hostsCounts: isDefined(hosts.counts) ? hosts.counts : state.hostsCounts,
        portsCounts: isDefined(ports.counts) ? ports.counts : state.portsCounts,
        applicationsCounts: isDefined(applications.counts)
          ? applications.counts
          : state.applicationsCounts,
        operatingSystemsCounts: isDefined(operatingsystems.counts)
          ? operatingsystems.counts
          : state.operatingSystemsCounts,
        cvesCounts: isDefined(cves.counts) ? cves.counts : state.cvesCounts,
        closedCvesCounts: isDefined(closedCves.counts)
          ? closedCves.counts
          : state.closedCvesCounts,
        tlsCertificatesCounts: isDefined(tlsCertificates.counts)
          ? tlsCertificates.counts
          : state.tlsCertificatesCounts,
        errorsCounts: isDefined(errors.counts)
          ? errors.counts
          : state.errorsCounts,
        reportFilter: props.reportFilter,
        isUpdating: false,
      };
    }
    // report is not in the store and is currently loaded
    return {
      isUpdating: true,
    };
  }

  componentDidMount() {
    this.props.loadSettings();
    this.props.loadFilters();
    this.props.loadReportFormats();
    this.props.loadReportComposerDefaults();
  }

  componentDidUpdate(prevProps) {
    const {reportFormats} = this.props;
    if (
      !isDefined(this.state.reportFormatId) &&
      isDefined(reportFormats) &&
      reportFormats.length > 0
    ) {
      // set initial report format id if available
      const reportFormatId = first(reportFormats).id;
      if (isDefined(reportFormatId)) {
        // ensure the report format id is only set if we really have one
        // if no report format id is available we would create an infinite
        // render loop here
        this.setState({reportFormatId});
      } else {
        // if there is no report format at all, throw a proper error message
        // instead of just showing x is undefined JS stacktrace
        const noReportFormatError = _(
          'The report cannot be displayed because' +
            ' no Greenbone Vulnerability Manager report format is available.' +
            ' This could be due to a missing gvmd data feed. Please update' +
            ' the gvmd data feed, check the "feed import owner" setting, or' +
            ' contact your system administrator.',
        );
        throw new Error(noReportFormatError);
      }
    }

    if (prevProps.reportId !== this.props.reportId) {
      this.load();
    }
  }

  load(filter) {
    log.debug('Loading report', {
      filter,
    });
    const {reportFilter} = this.props;

    this.setState({
      isUpdating: !isDefined(reportFilter) || !reportFilter.equals(filter), // show update indicator if filter has changed
    });

    this.props
      .reload(filter)
      .then(() => {
        this.setState({isUpdating: false});
      })
      .catch(() => {
        this.setState({isUpdating: false});
      });
  }

  reload() {
    // reload data from backend
    this.load(this.props.reportFilter);
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
    this.handleFilterChange(REPORT_RESET_FILTER);
  }

  handleFilterResetClick() {
    if (hasValue(this.props.resultDefaultFilter)) {
      this.handleFilterChange(this.props.resultDefaultFilter);
    } else {
      this.handleFilterChange(DEFAULT_FILTER);
    }
  }

  handleActivateTab(index) {
    this.handleInteraction();

    this.setState({activeTab: index});
  }

  handleAddToAssets() {
    const {gmp, showSuccessMessage, entity, reportFilter: filter} = this.props;

    this.handleInteraction();

    gmp.report.addAssets(entity, {filter}).then(() => {
      showSuccessMessage(
        _(
          'Report content added to Assets with QoD>=70% and Overrides enabled.',
        ),
      );
      this.reload();
    }, this.handleError);
  }

  handleRemoveFromAssets() {
    const {gmp, showSuccessMessage, entity, reportFilter: filter} = this.props;

    this.handleInteraction();

    gmp.report.removeAssets(entity, {filter}).then(() => {
      showSuccessMessage(_('Report content removed from Assets.'));
      this.reload();
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

  handleOpenDownloadReportDialog() {
    this.setState({
      showDownloadReportDialog: true,
    });
  }

  handleCloseDownloadReportDialog() {
    this.setState({showDownloadReportDialog: false});
  }

  handleReportDownload(state) {
    const {
      entity,
      gmp,
      reportComposerDefaults,
      reportExportFileName,
      reportFilter,
      reportFormats = [],
      username,
      onDownload,
    } = this.props;
    const {
      includeNotes,
      includeOverrides,
      reportFormatId,
      storeAsDefault,
    } = state;

    const newFilter = reportFilter.copy();
    newFilter.set('notes', includeNotes);
    newFilter.set('overrides', includeOverrides);

    if (storeAsDefault) {
      const defaults = {
        ...reportComposerDefaults,
        defaultReportFormatId: reportFormatId,
        includeNotes,
        includeOverrides,
      };
      this.props.saveReportComposerDefaults(defaults);
    }

    const report_format = reportFormats.find(
      format => reportFormatId === format.id,
    );

    const extension = isDefined(report_format)
      ? report_format.extension
      : 'unknown'; // unknown should never happen but we should be save here

    this.handleInteraction();

    return gmp.report
      .download(entity, {
        reportFormatId,
        filter: newFilter,
      })
      .then(response => {
        this.setState({showDownloadReportDialog: false});
        const {data} = response;
        const filename = generateFilename({
          creationTime: entity.creationTime,
          extension,
          fileNameFormat: reportExportFileName,
          id: entity.id,
          modificationTime: entity.modificationTime,
          reportFormat: report_format.name,
          resourceName: entity.task.name,
          resourceType: 'report',
          username,
        });

        onDownload({filename, data});
      }, this.handleError);
  }

  handleTlsCertificateDownload(cert) {
    const {onDownload} = this.props;

    const {data, serial} = cert;

    this.handleInteraction();

    onDownload({
      filename: 'tls-cert-' + serial + '.pem',
      mimetype: 'application/x-x509-ca-cert',
      data: create_pem_certificate(data),
    });
  }

  handleFilterCreated(filter) {
    this.handleInteraction();
    this.load(filter);
    this.props.loadFilters();
  }

  handleFilterAddLogLevel() {
    const {reportFilter} = this.props;
    let levels = reportFilter.get('levels', '');

    this.handleInteraction();

    if (!levels.includes('g')) {
      levels += 'g';
      const lfilter = reportFilter.copy();
      lfilter.set('levels', levels);
      this.load(lfilter);
    }
  }

  handleFilterRemoveSeverity() {
    const {reportFilter} = this.props;

    this.handleInteraction();

    if (reportFilter.has('severity')) {
      const lfilter = reportFilter.copy();
      lfilter.delete('severity');
      this.load(lfilter);
    }
  }

  handleFilterDecreaseMinQoD() {
    const {reportFilter} = this.props;

    this.handleInteraction();

    if (reportFilter.has('min_qod')) {
      const lfilter = reportFilter.copy();
      lfilter.set('min_qod', 30);
      this.load(lfilter);
    }
  }

  handleSortChange(name, sortField) {
    this.handleInteraction();

    const prev = this.state.sorting[name];

    const sortReverse =
      sortField === prev.sortField ? !prev.sortReverse : false;

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
      filters = [],
      gmp,
      isLoading,
      isLoadingFilters,
      pageFilter,
      reportError,
      reportFormats,
      reportId,
      onInteraction,
      reportComposerDefaults,
      showError,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;
    const {
      activeTab,
      applicationsCounts,
      cvesCounts,
      closedCvesCounts,
      entity,
      errorsCounts,
      hostsCounts,
      isUpdating = false,
      operatingSystemsCounts,
      portsCounts,
      reportFilter,
      resultsCounts,
      showFilterDialog,
      showDownloadReportDialog,
      sorting,
      storeAsDefault,
      tlsCertificatesCounts,
    } = this.state;

    const report = isDefined(entity) ? entity.report : undefined;

    const threshold = gmp.settings.reportResultsThreshold;
    const showThresholdMessage =
      isDefined(report) && report.results.counts.filtered > threshold;

    return (
      <React.Fragment>
        <PageTitle title={_('Report Details')} />
        <TargetComponent
          onError={this.handleError}
          onInteraction={onInteraction}
        >
          {({edit}) => (
            <Page
              activeTab={activeTab}
              applicationsCounts={applicationsCounts}
              cvesCounts={cvesCounts}
              closedCvesCounts={closedCvesCounts}
              entity={entity}
              errorsCounts={errorsCounts}
              filters={filters}
              hostsCounts={hostsCounts}
              isLoading={isLoading}
              isLoadingFilters={isLoadingFilters}
              isUpdating={isUpdating}
              operatingSystemsCounts={operatingSystemsCounts}
              pageFilter={pageFilter}
              portsCounts={portsCounts}
              reportError={reportError}
              reportFilter={reportFilter}
              reportId={reportId}
              resetFilter={REPORT_RESET_FILTER}
              resultsCounts={resultsCounts}
              sorting={sorting}
              task={isDefined(report) ? report.task : undefined}
              tlsCertificatesCounts={tlsCertificatesCounts}
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
              onReportDownloadClick={this.handleOpenDownloadReportDialog}
              onSortChange={this.handleSortChange}
              onTagSuccess={this.handleChanged}
              onTargetEditClick={() =>
                this.loadTarget().then(response => edit(response.data))
              }
              onTlsCertificateDownloadClick={this.handleTlsCertificateDownload}
              showError={showError}
              showErrorMessage={showErrorMessage}
              showSuccessMessage={showSuccessMessage}
            />
          )}
        </TargetComponent>
        {showFilterDialog && (
          <FilterDialog
            filter={reportFilter}
            delta={false}
            onFilterChanged={this.handleFilterChange}
            onCloseClick={this.handleFilterDialogClose}
            createFilterType="result"
            onFilterCreated={this.handleFilterCreated}
          />
        )}
        {showDownloadReportDialog && (
          <DownloadReportDialog
            defaultReportFormatId={reportComposerDefaults.defaultReportFormatId}
            filter={reportFilter}
            includeNotes={reportComposerDefaults.includeNotes}
            includeOverrides={reportComposerDefaults.includeOverrides}
            reportFormats={reportFormats}
            showThresholdMessage={showThresholdMessage}
            storeAsDefault={storeAsDefault}
            threshold={threshold}
            onClose={this.handleCloseDownloadReportDialog}
            onSave={this.handleReportDownload}
          />
        )}
      </React.Fragment>
    );
  }
}

ReportDetails.propTypes = {
  entity: PropTypes.model,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool,
  isLoadingFilters: PropTypes.bool,
  loadFilters: PropTypes.func.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadSettings: PropTypes.func.isRequired,
  loadTarget: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  pageFilter: PropTypes.filter,
  reload: PropTypes.func.isRequired,
  reportComposerDefaults: PropTypes.object,
  reportError: PropTypes.error,
  reportExportFileName: PropTypes.string,
  reportFilter: PropTypes.filter,
  reportFormats: PropTypes.array,
  reportId: PropTypes.id,
  resultDefaultFilter: PropTypes.filter,
  saveReportComposerDefaults: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  target: PropTypes.model,
  username: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const reloadInterval = report =>
  isDefined(report) && isActive(report.report.scan_run_status)
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : NO_RELOAD; // report doesn't change anymore. no need to reload

const load = ({
  defaultFilter,
  reportId,
  // eslint-disable-next-line no-shadow
  loadReportWithThreshold,
  pageFilter,
  reportFilter,
  updateFilter,
}) => filter => {
  if (!hasValue(filter)) {
    // use loaded filter after initial loading
    filter = reportFilter;
  }

  if (!hasValue(filter)) {
    // use filter from store
    filter = pageFilter;
  }

  if (!hasValue(filter)) {
    // use filter from user setting
    filter = defaultFilter;
  }

  if (!hasValue(filter)) {
    // use fallback filter
    filter = DEFAULT_FILTER;
  }

  updateFilter(filter);
  return loadReportWithThreshold(reportId, {filter});
};

const ReportDetailsWrapper = ({reportFilter, ...props}) => (
  <FilterProvider
    fallbackFilter={DEFAULT_FILTER}
    gmpname="result"
    pageName={`report-${props.reportId}`}
  >
    {({filter}) => (
      <Reload
        name={`report-${props.reportId}`}
        load={load({...props, defaultFilter: filter})}
        reload={load({...props, defaultFilter: filter, reportFilter})}
        reloadInterval={() => reloadInterval(props.entity)}
      >
        {({reload}) => (
          <ReportDetails
            {...props}
            defaultFilter={filter}
            reportFilter={reportFilter}
            reload={reload}
          />
        )}
      </Reload>
    )}
  </FilterProvider>
);

ReportDetailsWrapper.propTypes = {
  entity: PropTypes.model,
  gmp: PropTypes.gmp.isRequired,
  reportFilter: PropTypes.filter,
  reportId: PropTypes.id.isRequired,
};

const getReportPageName = id => `report-${id}`;

const mapDispatchToProps = (dispatch, {gmp, match}) => ({
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
  loadFilters: () => dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER)),
  loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  loadTarget: targetId => gmp.target.get({id: targetId}),
  loadReportFormats: () =>
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
  loadReportWithThreshold: (id, options) =>
    dispatch(loadReportWithThreshold(gmp)(id, options)),
  loadReportComposerDefaults: () => dispatch(loadReportComposerDefaults(gmp)()),
  saveReportComposerDefaults: reportComposerDefaults =>
    dispatch(saveReportComposerDefaults(gmp)(reportComposerDefaults)),
  updateFilter: f =>
    dispatch(setPageFilter(getReportPageName(match.params.id), f)),
});

const mapStateToProps = (rootState, {match}) => {
  const {id} = match.params;
  const filterSel = filterSelector(rootState);
  const reportSel = reportSelector(rootState);
  const reportFormatsSel = reportFormatsSelector(rootState);
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const userDefaultFilterSel = getUserSettingsDefaultFilter(
    rootState,
    'result',
  );
  const username = getUsername(rootState);

  const pSelector = getPage(rootState);
  const pageFilter = pSelector.getFilter(getReportPageName(id));

  const entity = reportSel.getEntity(id, pageFilter);
  const isLoading = reportSel.isLoadingEntity(id, pageFilter);
  const reportError = reportSel.getEntityError(id, pageFilter);

  const filters = filterSel.getAllEntities(RESULTS_FILTER_FILTER);
  const isLoadingFilters = filterSel.isLoadingAllEntities(
    RESULTS_FILTER_FILTER,
  );

  return {
    entity,
    filters,
    reportError,
    pageFilter,
    isLoading,
    isLoadingFilters,
    reportExportFileName: userDefaultsSelector.getValueByName(
      'reportexportfilename',
    ),
    reportFilter: getFilter(entity),
    reportFormats: reportFormatsSel.getAllEntities(REPORT_FORMATS_FILTER),
    reportId: id,
    reportComposerDefaults: getReportComposerDefaults(rootState),
    resultDefaultFilter: userDefaultFilterSel.getFilter(),
    username,
  };
};

export default compose(
  withGmp,
  withDialogNotification,
  withDownload,
  connect(mapStateToProps, mapDispatchToProps),
)(ReportDetailsWrapper);

// vim: set ts=2 sw=2 tw=80:
