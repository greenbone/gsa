/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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
import withDialogNotification from 'web/components/notification/withDialogNotifiaction';
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
  renewSessionTimeout,
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

const getTarget = (entity = {}) => {
  const {report = {}} = entity;
  const {task = {}} = report;
  return task.target;
};

const getFilter = (entity = {}) => {
  const {report = {}} = entity;
  return report.filter;
};

class DeltaReportDetails extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
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
    this.handleFilterDialogClose = this.handleFilterDialogClose.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);

    this.loadTarget = this.loadTarget.bind(this);
    this.handleOpenDownloadReportDialog =
      this.handleOpenDownloadReportDialog.bind(this);
    this.handleCloseDownloadReportDialog =
      this.handleCloseDownloadReportDialog.bind(this);
  }

  componentDidMount() {
    this.props.loadSettings();
    this.props.loadFilters();
    this.props.loadReportConfigs();
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
      }
    }

    if (
      prevProps.reportId !== this.props.reportId ||
      prevProps.deltaReportId !== this.props.deltaReportId
    ) {
      this.load();
    }
  }

  load(filter) {
    log.debug('Loading deleta report', {
      filter,
    });

    this.setState(({lastFilter}) => ({
      isUpdating: isDefined(lastFilter) && !lastFilter.equals(filter), // show update indicator if filter has changed
      lastFilter: filter,
    }));

    this.props.reload(filter).then(() => {
      this.setState({isUpdating: false});
    });
  }

  reload() {
    // reload data from backend
    this.load(this.state.lastFilter);
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
    this.handleFilterChange(this.props.resultDefaultFilter);
  }

  handleAddToAssets() {
    const {_} = this.props;

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
    const {_} = this.props;

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
      deltaReportId,
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
      reportConfigId,
      reportFormatId,
      storeAsDefault,
    } = state;

    const newFilter = reportFilter.copy();
    newFilter.set('notes', includeNotes);
    newFilter.set('overrides', includeOverrides);

    if (storeAsDefault) {
      const defaults = {
        ...reportComposerDefaults,
        defaultReportConfigId: reportConfigId,
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
        reportConfigId,
        reportFormatId,
        deltaReportId,
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
      entity,
      entityError,
      filters = [],
      isLoading,
      reportFilter,
      reportFormats,
      reportConfigs,
      reportId,
      onInteraction,
      reportComposerDefaults,
      showError,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;
    const {
      isUpdating = false,
      showFilterDialog,
      showDownloadReportDialog,
      sorting,
      storeAsDefault,
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
              onAddToAssetsClick={this.handleAddToAssets}
              onError={this.handleError}
              onFilterAddLogLevelClick={this.handleFilterAddLogLevel}
              onFilterChanged={this.handleFilterChange}
              onFilterCreated={this.handleFilterCreated}
              onFilterDecreaseMinQoDClick={this.handleFilterDecreaseMinQoD}
              onFilterEditClick={this.handleFilterEditClick}
              onFilterRemoveClick={this.handleFilterRemoveClick}
              onFilterRemoveSeverityClick={this.handleFilterRemoveSeverity}
              onFilterResetClick={this.handleFilterResetClick}
              onInteraction={onInteraction}
              onRemoveFromAssetsClick={this.handleRemoveFromAssets}
              onReportDownloadClick={this.handleOpenDownloadReportDialog}
              onSortChange={this.handleSortChange}
              onTagSuccess={this.handleChanged}
              onTargetEditClick={() =>
                this.loadTarget().then(response => edit(response.data))
              }
            />
          )}
        </TargetComponent>
        {showFilterDialog && (
          <ReportDetailsFilterDialog
            createFilterType="result"
            delta={true}
            filter={reportFilter}
            onCloseClick={this.handleFilterDialogClose}
            onFilterChanged={this.handleFilterChange}
            onFilterCreated={this.handleFilterCreated}
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
            onClose={this.handleCloseDownloadReportDialog}
            onSave={this.handleReportDownload}
          />
        )}
      </React.Fragment>
    );
  }
}

DeltaReportDetails.propTypes = {
  defaultFilter: PropTypes.filter,
  deltaReportId: PropTypes.id,
  entity: PropTypes.model,
  entityError: PropTypes.object,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadFilters: PropTypes.func.isRequired,
  loadReport: PropTypes.func.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  loadReportConfigs: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadReportIfNeeded: PropTypes.func.isRequired,
  loadSettings: PropTypes.func.isRequired,
  loadTarget: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
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
  target: PropTypes.model,
  username: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
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
  _: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  withDialogNotification,
  withDownload,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(DeltaReportDetailsWrapper);
