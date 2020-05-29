/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import 'core-js/features/string/includes';

import React, {useEffect, useCallback, useState, useReducer} from 'react';

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
import usePrevious from 'web/utils/usePrevious';

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

const initialState = {
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

const reportReducer = (state, action) => {
  switch (action.type) {
    case 'sortChange':
      const {name, sortField} = action;
      const prev = state.sorting[name];

      const sortReverse =
        sortField === prev.sortField ? !prev.sortReverse : false;
      return {
        ...state,
        sorting: {
          ...state.sorting,
          [name]: {
            sortField,
            sortReverse,
          },
        },
      };
    case 'updateReport':
      const {report = {}} = action.entity;

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
        ...state,
        entity: action.entity,
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
      };
    case 'setPageState':
      const {newState} = action;

      return {
        ...state,
        ...newState,
      };
    default:
      throw new Error('Unexpected action');
  }
};

const ReportDetails = props => {
  const prevReportId = usePrevious(props.reportId);

  const [isUpdating, setIsUpdating] = useState(false);
  const [state, dispatchState] = useReducer(reportReducer, initialState);

  useEffect(() => {
    if (isDefined(props.entity)) {
      dispatchState({type: 'updateReport', entity: props.entity});
      dispatchState({
        type: 'setPageState',
        newState: {reportFilter: props.reportFilter},
      });
      setIsUpdating(false);
    } else {
      // report is not in the store and is currently loaded
      setIsUpdating(true);
    }
  }, [props.entity]);

  useEffect(() => {
    props.loadSettings();
    props.loadFilters();
    props.loadReportFormats();
    props.loadReportComposerDefaults();
  }, [
    props.loadSettings,
    props.loadFilters,
    props.loadReportFormats,
    props.loadReportComposerDefaults,
  ]); // componentDidMount

  const load = filter => {
    log.debug('Loading report', {
      filter,
    });
    const {reportFilter} = props;

    setIsUpdating(!isDefined(reportFilter) || !reportFilter.equals(filter));
    // show update indicator if filter has changed

    props
      .reload(filter)
      .then(() => {
        setIsUpdating(false);
      })
      .catch(() => {
        setIsUpdating(false);
      });
  };

  useEffect(() => {
    const {reportFormats} = props;
    if (
      !isDefined(state.reportFormatId) &&
      isDefined(reportFormats) &&
      reportFormats.length > 0
    ) {
      // set initial report format id if available
      const reportFormatId = first(reportFormats).id;
      if (isDefined(reportFormatId)) {
        // ensure the report format id is only set if we really have one
        // if no report format id is available we would create an infinite
        // render loop here
        dispatchState({type: 'setPageState', newState: {reportFormatId}});
      }
    }

    if (prevReportId !== props.reportId) {
      load();
    }
  }, [state.reportFormatId, prevReportId, props, load]);

  const reload = () => {
    // reload data from backend
    load(props.reportFilter);
  };

  const handleChanged = () => {
    reload();
  };

  const handleError = error => {
    const {showError} = props;
    log.error(error);
    showError(error);
  };

  const handleFilterChange = filter => {
    handleInteraction();

    load(filter);
  };

  const handleFilterRemoveClick = () => {
    handleFilterChange(REPORT_RESET_FILTER);
  };

  const handleFilterResetClick = () => {
    if (hasValue(props.resultDefaultFilter)) {
      handleFilterChange(props.resultDefaultFilter);
    } else {
      handleFilterChange(DEFAULT_FILTER);
    }
  };

  const handleActivateTab = index => {
    handleInteraction();

    dispatchState({type: 'setPageState', newState: {activeTab: index}});
  };

  const handleAddToAssets = () => {
    const {gmp, showSuccessMessage, entity, reportFilter: filter} = props;

    handleInteraction();

    gmp.report.addAssets(entity, {filter}).then(() => {
      showSuccessMessage(
        _(
          'Report content added to Assets with QoD>=70% and Overrides enabled.',
        ),
      );
      reload();
    }, handleError);
  };

  const handleRemoveFromAssets = () => {
    const {gmp, showSuccessMessage, entity, reportFilter: filter} = props;

    handleInteraction();

    gmp.report.removeAssets(entity, {filter}).then(() => {
      showSuccessMessage(_('Report content removed from Assets.'));
      reload();
    }, handleError);
  };

  const handleFilterEditClick = () => {
    handleInteraction();

    dispatchState({type: 'setPageState', newState: {showFilterDialog: true}});
  };

  const handleFilterDialogClose = () => {
    handleInteraction();

    dispatchState({type: 'setPageState', newState: {showFilterDialog: false}});
  };

  const handleOpenDownloadReportDialog = () => {
    dispatchState({
      type: 'setPageState',
      newState: {showDownloadReportDialog: true},
    });
  };

  const handleCloseDownloadReportDialog = () => {
    dispatchState({
      type: 'setPageState',
      newState: {showDownloadReportDialog: false},
    });
  };

  const handleReportDownload = state => {
    const {
      entity,
      gmp,
      reportComposerDefaults,
      reportExportFileName,
      reportFilter,
      reportFormats = [],
      username,
      onDownload,
    } = props;
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
      props.saveReportComposerDefaults(defaults);
    }

    const report_format = reportFormats.find(
      format => reportFormatId === format.id,
    );

    const extension = isDefined(report_format)
      ? report_format.extension
      : 'unknown'; // unknown should never happen but we should be save here

    handleInteraction();

    return gmp.report
      .download(entity, {
        reportFormatId,
        filter: newFilter,
      })
      .then(response => {
        dispatchState({
          type: 'setPageState',
          newState: {showDownloadReportDialog: false},
        });
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
      }, handleError);
  };

  const handleTlsCertificateDownload = cert => {
    const {onDownload} = props;

    const {data, serial} = cert;

    handleInteraction();

    onDownload({
      filename: 'tls-cert-' + serial + '.pem',
      mimetype: 'application/x-x509-ca-cert',
      data: create_pem_certificate(data),
    });
  };

  const handleFilterCreated = filter => {
    handleInteraction();
    load(filter);
    props.loadFilters();
  };

  const handleFilterAddLogLevel = () => {
    const {reportFilter} = props;
    let levels = reportFilter.get('levels', '');

    handleInteraction();

    if (!levels.includes('g')) {
      levels += 'g';
      const lfilter = reportFilter.copy();
      lfilter.set('levels', levels);
      load(lfilter);
    }
  };

  const handleFilterRemoveSeverity = () => {
    const {reportFilter} = props;

    handleInteraction();

    if (reportFilter.has('severity')) {
      const lfilter = reportFilter.copy();
      lfilter.delete('severity');
      load(lfilter);
    }
  };

  const handleFilterDecreaseMinQoD = () => {
    const {reportFilter} = props;

    handleInteraction();

    if (reportFilter.has('min_qod')) {
      const lfilter = reportFilter.copy();
      lfilter.set('min_qod', 30);
      load(lfilter);
    }
  };

  const handleSortChange = (name, sortField) => {
    handleInteraction();

    dispatchState({type: 'sortChange', name, sortField});
  };

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const loadTarget = () => {
    const {entity} = props;
    const target = getTarget(entity);

    return props.loadTarget(target.id);
  };

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
  } = props;
  const {
    activeTab,
    applicationsCounts,
    cvesCounts,
    closedCvesCounts,
    entity,
    errorsCounts,
    hostsCounts,
    operatingSystemsCounts,
    portsCounts,
    reportFilter,
    resultsCounts,
    showFilterDialog,
    showDownloadReportDialog,
    sorting,
    storeAsDefault,
    tlsCertificatesCounts,
  } = state;

  const report = isDefined(entity) ? entity.report : undefined;

  const threshold = gmp.settings.reportResultsThreshold;
  const showThresholdMessage =
    isDefined(report) && report.results.counts.filtered > threshold;

  return (
    <React.Fragment>
      <PageTitle title={_('Report Details')} />
      <TargetComponent onError={handleError} onInteraction={onInteraction}>
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
            onActivateTab={handleActivateTab}
            onAddToAssetsClick={handleAddToAssets}
            onError={handleError}
            onFilterAddLogLevelClick={handleFilterAddLogLevel}
            onFilterDecreaseMinQoDClick={handleFilterDecreaseMinQoD}
            onFilterChanged={handleFilterChange}
            onFilterCreated={handleFilterCreated}
            onFilterEditClick={handleFilterEditClick}
            onFilterRemoveSeverityClick={handleFilterRemoveSeverity}
            onFilterResetClick={handleFilterResetClick}
            onFilterRemoveClick={handleFilterRemoveClick}
            onInteraction={onInteraction}
            onRemoveFromAssetsClick={handleRemoveFromAssets}
            onReportDownloadClick={handleOpenDownloadReportDialog}
            onSortChange={handleSortChange}
            onTagSuccess={handleChanged}
            onTargetEditClick={() =>
              loadTarget().then(response => edit(response.data))
            }
            onTlsCertificateDownloadClick={handleTlsCertificateDownload}
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
          onFilterChanged={handleFilterChange}
          onCloseClick={handleFilterDialogClose}
          createFilterType="result"
          onFilterCreated={handleFilterCreated}
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
          onClose={handleCloseDownloadReportDialog}
          onSave={handleReportDownload}
        />
      )}
    </React.Fragment>
  );
};

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
  reportFilter,
  updateFilter,
}) => filter => {
  if (!hasValue(filter)) {
    // use loaded filter after initial loading
    filter = reportFilter;
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
    // deactivate filter via url param for now. not sure why we are doing this
    locationQueryFilterString={null}
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
