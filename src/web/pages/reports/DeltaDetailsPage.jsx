/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import logger from 'gmp/log';
import Filter, {
  ALL_FILTER,
  RESET_FILTER,
  RESULTS_FILTER_FILTER,
} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';
import {first} from 'gmp/utils/array';
import {isDefined, hasValue} from 'gmp/utils/identity';
import withDownload from 'web/components/form/withDownload';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import withDialogNotification from 'web/components/notification/withDialogNotification';
import Page from 'web/pages/reports/DeltaDetailsContent';
import ReportDetailsFilterDialog from 'web/pages/reports/DetailsFilterDialog';
import DownloadReportDialog from 'web/pages/reports/DownloadReportDialog';
import TargetComponent from 'web/pages/targets/Component';
import {
  loadAllEntities as loadFilters,
  selector as filterSelector,
} from 'web/store/entities/filters';
import {loadDeltaReport} from 'web/store/entities/report/actions';
import {deltaReportSelector} from 'web/store/entities/report/selectors';
import {
  loadAllEntities as loadReportConfigs,
  selector as reportConfigsSelector,
} from 'web/store/entities/reportconfigs';
import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';
import {
  loadReportComposerDefaults,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {
  getReportComposerDefaults,
  getUsername,
} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import {withRouter} from 'web/utils/withRouter';
import withTranslation from 'web/utils/withTranslation';

const log = logger.getLogger('web.pages.report.deltadetailspage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity',
);

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

const getFilter = (entity = {}) => {
  const {report = {}} = entity;
  return report.filter;
};

const DeltaReportDetails = props => {
  const {
    deltaReportId,
    entity,
    entityError,
    filters = [],
    gmp,
    isLoading,
    loadFilters,

    loadReportComposerDefaults,
    loadReportConfigs,
    loadReportFormats,
    loadSettings,
    loadTarget,

    reload,
    reportComposerDefaults = {},
    reportExportFileName,
    reportFilter,
    reportFormats = [],
    reportConfigs = [],
    reportId,
    resultDefaultFilter,
    saveReportComposerDefaults,
    showError,
    showErrorMessage,
    showSuccessMessage,
    username,
    onDownload,
    _,
  } = props;

  // State
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);
  const [sorting, setSorting] = useState({
    results: {sortField: 'severity', sortReverse: true},
    apps: {sortField: 'severity', sortReverse: true},
    ports: {sortField: 'severity', sortReverse: true},
    hosts: {sortField: 'severity', sortReverse: true},
    os: {sortField: 'severity', sortReverse: true},
    cves: {sortField: 'severity', sortReverse: true},
    closedcves: {sortField: 'severity', sortReverse: true},
    tlscerts: {sortField: 'dn', sortReverse: false},
    errors: {sortField: 'error', sortReverse: false},
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastFilter, setLastFilter] = useState();
  const [storeAsDefault, setStoreAsDefault] = useState(false);
  const [reportFormatId, setReportFormatId] = useState();

  // Initial load
  useEffect(() => {
    loadSettings();
    loadFilters();
    loadReportConfigs();
    loadReportFormats();
    loadReportComposerDefaults();
  }, []);

  // Set initial reportFormatId if available
  useEffect(() => {
    if (!reportFormatId && reportFormats && reportFormats.length > 0) {
      const id = first(reportFormats).id;
      if (isDefined(id)) setReportFormatId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFormats]);

  // Reload on id change
  useEffect(() => {
    setIsUpdating(false);
    setLastFilter(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, deltaReportId]);

  // Load function
  const load = filter => {
    log.debug('Loading deleta report', {filter});
    setIsUpdating(isDefined(lastFilter) && !lastFilter?.equals?.(filter));
    setLastFilter(filter);
    return reload(filter).then(() => setIsUpdating(false));
  };

  // Handlers
  const handleChanged = () => load(lastFilter);
  const handleError = error => {
    log.error(error);
    showError(error);
  };
  const handleFilterChange = filter => load(filter);
  const handleFilterRemoveClick = () => handleFilterChange(RESET_FILTER);
  const handleFilterResetClick = () => handleFilterChange(resultDefaultFilter);
  const handleAddToAssets = () => {
    gmp.report.addAssets(entity, {filter: reportFilter}).then(() => {
      showSuccessMessage(
        _(
          'Report content added to Assets with QoD>=70% and Overrides enabled.',
        ),
      );
      handleChanged();
    }, handleError);
  };
  const handleRemoveFromAssets = () => {
    gmp.report.removeAssets(entity, {filter: reportFilter}).then(() => {
      showSuccessMessage(_('Report content removed from Assets.'));
      handleChanged();
    }, handleError);
  };
  const handleFilterEditClick = () => setShowFilterDialog(true);
  const handleFilterDialogClose = () => setShowFilterDialog(false);
  const handleOpenDownloadReportDialog = () =>
    setShowDownloadReportDialog(true);
  const handleCloseDownloadReportDialog = () =>
    setShowDownloadReportDialog(false);
  const handleReportDownload = state => {
    const {
      includeNotes,
      includeOverrides,
      reportConfigId,
      reportFormatId: chosenFormatId,
      storeAsDefault: storeDefault,
    } = state;
    const newFilter = reportFilter.copy();
    newFilter.set('notes', includeNotes);
    newFilter.set('overrides', includeOverrides);
    if (storeDefault) {
      const defaults = {
        ...reportComposerDefaults,
        defaultReportConfigId: reportConfigId,
        defaultReportFormatId: chosenFormatId,
        includeNotes,
        includeOverrides,
      };
      saveReportComposerDefaults(defaults);
    }
    const report_format = reportFormats.find(f => chosenFormatId === f.id);
    const extension = isDefined(report_format)
      ? report_format.extension
      : 'unknown';
    return gmp.report
      .download(entity, {
        reportConfigId,
        reportFormatId: chosenFormatId,
        deltaReportId,
        filter: newFilter,
      })
      .then(response => {
        setShowDownloadReportDialog(false);
        const {data} = response;
        const filename = generateFilename({
          creationTime: entity.creationTime,
          extension,
          fileNameFormat: reportExportFileName,
          id: entity.id,
          modificationTime: entity.modificationTime,
          reportFormat: report_format?.name,
          resourceName: entity.task?.name,
          resourceType: 'report',
          username,
        });
        onDownload({filename, data});
      }, handleError);
  };
  const handleFilterCreated = filter => {
    load(filter);
    loadFilters();
  };
  const handleFilterAddLogLevel = () => {
    let levels = reportFilter.get('levels', '');
    if (!levels.includes('g')) {
      levels += 'g';
      const lfilter = reportFilter.copy();
      lfilter.set('levels', levels);
      load(lfilter);
    }
  };
  const handleFilterRemoveSeverity = () => {
    if (reportFilter.has('severity')) {
      const lfilter = reportFilter.copy();
      lfilter.delete('severity');
      load(lfilter);
    }
  };
  const handleFilterDecreaseMinQoD = () => {
    if (reportFilter.has('min_qod')) {
      const lfilter = reportFilter.copy();
      lfilter.set('min_qod', 30);
      load(lfilter);
    }
  };
  const handleSortChange = (name, sortField) => {
    const prev = sorting[name];
    const sortReverse =
      sortField === prev.sortField ? !prev.sortReverse : false;
    setSorting({
      ...sorting,
      [name]: {sortField, sortReverse},
    });
  };

  const {report} = entity || {};

  return (
    <>
      <TargetComponent onError={handleError}>
        {({edit}) => (
          <Page
            entity={entity}
            entityError={entityError}
            filter={reportFilter}
            filters={filters}
            isLoading={isLoading}
            isUpdating={isUpdating}
            reportId={reportId}
            showError={showError}
            showErrorMessage={showErrorMessage}
            showSuccessMessage={showSuccessMessage}
            sorting={sorting}
            task={isDefined(report) ? report.task : undefined}
            onAddToAssetsClick={handleAddToAssets}
            onError={handleError}
            onFilterAddLogLevelClick={handleFilterAddLogLevel}
            onFilterChanged={handleFilterChange}
            onFilterCreated={handleFilterCreated}
            onFilterDecreaseMinQoDClick={handleFilterDecreaseMinQoD}
            onFilterEditClick={handleFilterEditClick}
            onFilterRemoveClick={handleFilterRemoveClick}
            onFilterRemoveSeverityClick={handleFilterRemoveSeverity}
            onFilterResetClick={handleFilterResetClick}
            onRemoveFromAssetsClick={handleRemoveFromAssets}
            onReportDownloadClick={handleOpenDownloadReportDialog}
            onSortChange={handleSortChange}
            onTagSuccess={handleChanged}
            onTargetEditClick={() =>
              loadTarget().then(response => edit(response.data))
            }
          />
        )}
      </TargetComponent>
      {showFilterDialog && (
        <ReportDetailsFilterDialog
          createFilterType="result"
          delta={true}
          filter={reportFilter}
          onCloseClick={handleFilterDialogClose}
          onFilterChanged={handleFilterChange}
          onFilterCreated={handleFilterCreated}
        />
      )}
      {showDownloadReportDialog && (
        <DownloadReportDialog
          defaultReportConfigId={reportComposerDefaults.defaultReportConfigId}
          defaultReportFormatId={reportComposerDefaults.defaultReportFormatId}
          filter={reportFilter}
          includeNotes={reportComposerDefaults.includeNotes}
          includeOverrides={reportComposerDefaults.includeOverrides}
          reportConfigs={reportConfigs}
          reportFormats={reportFormats}
          storeAsDefault={storeAsDefault}
          onClose={handleCloseDownloadReportDialog}
          onSave={handleReportDownload}
        />
      )}
    </>
  );
};

DeltaReportDetails.propTypes = {
  deltaReportId: PropTypes.id,
  entity: PropTypes.model,
  entityError: PropTypes.object,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadFilters: PropTypes.func.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  loadReportConfigs: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadSettings: PropTypes.func.isRequired,
  loadTarget: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  reportComposerDefaults: PropTypes.object,
  reportExportFileName: PropTypes.string,
  reportFilter: PropTypes.filter,
  reportFormats: PropTypes.array,
  reportConfigs: PropTypes.array,
  reportId: PropTypes.id,
  resultDefaultFilter: PropTypes.filter,
  saveReportComposerDefaults: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  username: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    loadFilters: () => dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER)),
    loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
    loadTarget: targetId => gmp.target.get({id: targetId}),
    loadReportConfigs: () => dispatch(loadReportConfigs(gmp)(ALL_FILTER)),
    loadReportFormats: () =>
      dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
    loadReport: (id, deltaId, filter) =>
      dispatch(loadDeltaReport(gmp)(id, deltaId, filter)),
    loadReportIfNeeded: (id, deltaId, filter) =>
      dispatch(loadDeltaReport(gmp)(id, deltaId, filter)),
    loadReportComposerDefaults: () =>
      dispatch(loadReportComposerDefaults(gmp)()),
    loadUserSettingDefaultFilter: () =>
      dispatch(loadUserSettingsDefaultFilter(gmp)('result')),
    saveReportComposerDefaults: reportComposerDefaults =>
      dispatch(saveReportComposerDefaults(gmp)(reportComposerDefaults)),
  };
};

const mapStateToProps = (rootState, {params}) => {
  const {id, deltaid} = params;

  const filterSel = filterSelector(rootState);
  const deltaSel = deltaReportSelector(rootState);
  const reportFormatsSel = reportFormatsSelector(rootState);
  const reportConfigsSel = reportConfigsSelector(rootState);
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const userDefaultFilterSel = getUserSettingsDefaultFilter(
    rootState,
    'result',
  );
  const username = getUsername(rootState);
  const entity = deltaSel.getEntity(id, deltaid);
  const entityError = deltaSel.getError(id, deltaid);

  return {
    deltaReportId: deltaid,
    entity,
    entityError,
    filters: filterSel.getAllEntities(RESULTS_FILTER_FILTER),
    isLoading: !isDefined(entity),
    reportExportFileName: userDefaultsSelector.getValueByName(
      'reportexportfilename',
    ),
    reportFilter: getFilter(entity),
    reportConfigs: reportConfigsSel.getAllEntities(ALL_FILTER),
    reportFormats: reportFormatsSel.getAllEntities(REPORT_FORMATS_FILTER),
    reportId: id,
    reportComposerDefaults: getReportComposerDefaults(rootState),
    resultDefaultFilter: userDefaultFilterSel.getFilter('result'),
    username,
  };
};

const reloadInterval = report =>
  isDefined(report) && isActive(report.report.scan_run_status)
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : NO_RELOAD; // report doesn't change anymore. no need to reload

const load =
  ({
    defaultFilter,
    reportId,
    deltaReportId,
    loadReport,
    loadReportIfNeeded,
    reportFilter,
  }) =>
  filter => {
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

    // to avoid confusion of loaded results with different sort terms and
    // directions, always load the report with sort=name from gvmd (the user's
    // sort term will be handled by GSA in the browser)
    filter.delete('sort-reverse');
    filter.set('sort', 'name');
    return loadReportIfNeeded(reportId, deltaReportId, filter).then(() =>
      loadReport(reportId, deltaReportId, filter),
    );
  };

const TranslatedDeltaReportDetails = withTranslation(DeltaReportDetails);

const DeltaReportDetailsWrapper = ({defaultFilter, reportFilter, ...props}) => (
  <Reload
    load={load({...props, defaultFilter})}
    name="report"
    reload={load({...props, defaultFilter, reportFilter})}
    reloadInterval={() => reloadInterval(props.entity)}
  >
    {({reload}) => (
      <TranslatedDeltaReportDetails
        {...props}
        defaultFilter={defaultFilter}
        reload={reload}
        reportFilter={reportFilter}
      />
    )}
  </Reload>
);

DeltaReportDetailsWrapper.propTypes = {
  defaultFilter: PropTypes.filter,
  entity: PropTypes.model,
  gmp: PropTypes.gmp.isRequired,
  reportFilter: PropTypes.filter,
};

export default compose(
  withGmp,
  withDialogNotification,
  withDownload,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(DeltaReportDetailsWrapper);
