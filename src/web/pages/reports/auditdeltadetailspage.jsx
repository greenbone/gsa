/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import Filter, {
  ALL_FILTER,
  RESET_FILTER,
  RESULTS_FILTER_FILTER,
} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';
import {first} from 'gmp/utils/array';
import {isDefined, hasValue} from 'gmp/utils/identity';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {useParams} from 'react-router';
import withDownload from 'web/components/form/withDownload';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';
import withDialogNotification from 'web/components/notification/withDialogNotifiaction';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import DownloadReportDialog from 'web/pages/reports/downloadreportdialog';
import {
  loadAllEntities as loadFilters,
  selector as filterSelector,
} from 'web/store/entities/filters';
import {loadDeltaAuditReport} from 'web/store/entities/report/actions';
import {deltaAuditReportSelector} from 'web/store/entities/report/selectors';
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
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {
  getReportComposerDefaults,
  getUsername,
} from 'web/store/usersettings/selectors';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';

import Page from './deltadetailscontent';
import FilterDialog from './detailsfilterdialog';
import TargetComponent from '../targets/component';

const log = logger.getLogger('web.pages.report.deltadetailspage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=hmlg rows=100 min_qod=70 first=1 sort-reverse=compliant',
);

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

const getTarget = (entity = {}) => {
  const {report = {}} = entity;
  const {task = {}} = report;
  return task.target;
};

const DeltaAuditReportDetails = props => {
  const [activeTab, setActiveTab] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);
  const [reportFormatId, setReportFormatId] = useState();
  const [isUpdating, setIsUpdating] = useState(false);
  // storeAsDefault is set in SaveDialogContent
  // eslint-disable-next-line no-unused-vars
  const [storeAsDefault, setStoreAsDefault] = useState();

  const [sorting, setSorting] = useState({
    results: {
      sortField: 'compliant',
      sortReverse: true,
    },
    errors: {
      sortField: 'error',
      sortReverse: false,
    },
  });

  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const params = useParams();
  const {id: reportId, deltaid: deltaReportId} = params;

  const reportFormatsSel = useSelector(reportFormatsSelector);
  const reportConfigsSel = useSelector(reportConfigsSelector);
  const reportFormats = reportFormatsSel?.getAllEntities(REPORT_FORMATS_FILTER);
  const reportConfigs = reportConfigsSel?.getAllEntities(ALL_FILTER);
  const userDefaultFilterSel = useSelector(
    rootState => getUserSettingsDefaultFilter(rootState, 'result'),
    shallowEqual,
  );
  const resultDefaultFilter = userDefaultFilterSel?.getFilter('result');
  const reportComposerDefaults = useSelector(getReportComposerDefaults);
  const userDefaultsSelector = useSelector(
    getUserSettingsDefaults,
    shallowEqual,
  );
  const reportExportFileName = userDefaultsSelector?.getValueByName(
    'reportexportfilename',
  );
  const username = useSelector(getUsername);
  const filterSel = useSelector(filterSelector);
  const filters = filterSel?.getAllEntities(RESULTS_FILTER_FILTER);
  const [entity, entityError] = useSelector(state => {
    const deltaSel = deltaAuditReportSelector(state);
    return [
      deltaSel?.getEntity(reportId, deltaReportId),
      deltaSel?.getError(reportId, deltaReportId),
    ];
  });
  const isLoading = !isDefined(entity);

  useEffect(() => {
    dispatch(loadUserSettingDefaults(gmp)());
    dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER));
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER));
    dispatch(loadReportConfigs(gmp)(ALL_FILTER));
    dispatch(loadReportComposerDefaults(gmp)());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !isDefined(reportFormatId) &&
      isDefined(reportFormats) &&
      reportFormats.length > 0
    ) {
      // set initial report format id if available
      const initialReportFormatId = first(reportFormats).id;
      if (isDefined(initialReportFormatId)) {
        // ensure the report format id is only set if we really have one
        // if no report format id is available we would create an infinite
        // render loop here
        setReportFormatId({initialReportFormatId});
      } else {
        // if there is no report format at all, throw a proper error message
        // instead of just showing x is undefined JS stacktrace
        const noReportFormatError = _(
          'The report cannot be displayed because' +
            ' no report format is available.' +
            ' This could be due to a missing gvmd data feed. Please update' +
            ' the gvmd data feed, check the "feed import owner" setting, the' +
            ' feed status page, or contact your system administrator.',
        );
        throw new Error(noReportFormatError);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFormats, reportFormatId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, deltaReportId]);

  const load = filter => {
    log.debug('Loading report', {
      filter,
    });
    const {reportFilter: prevFilter} = props;

    setIsUpdating(!isDefined(prevFilter) || !prevFilter.equals(filter));

    props
      .reload(filter)
      .then(() => {
        setIsUpdating(false);
      })
      .catch(() => {
        setIsUpdating(false);
      });
  };

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
    handleFilterChange(RESET_FILTER);
  };

  const handleFilterResetClick = () => {
    if (hasValue(resultDefaultFilter)) {
      handleFilterChange(resultDefaultFilter);
    } else {
      handleFilterChange(DEFAULT_FILTER);
    }
  };

  const handleActivateTab = index => {
    handleInteraction();
    setActiveTab(index);
  };

  const handleAddToAssets = () => {
    const {showSuccessMessage, reportFilter: filter} = props;

    handleInteraction();

    gmp.auditreport.addAssets(entity, {filter}).then(() => {
      showSuccessMessage(
        _(
          'Report content added to Assets with QoD>=70% and Overrides enabled.',
        ),
      );
      reload();
    }, handleError);
  };

  const handleRemoveFromAssets = () => {
    const {showSuccessMessage, reportFilter: filter} = props;

    handleInteraction();

    gmp.auditreport.removeAssets(entity, {filter}).then(() => {
      showSuccessMessage(_('Report content removed from Assets.'));
      reload();
    }, handleError);
  };

  const handleFilterEditClick = () => {
    handleInteraction();

    setShowFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    handleInteraction();
    setShowFilterDialog(false);
  };

  const handleOpenDownloadReportDialog = () => {
    setShowDownloadReportDialog(true);
  };

  const handleCloseDownloadReportDialog = () => {
    setShowDownloadReportDialog(false);
  };

  const handleReportDownload = state => {
    const {reportFilter, onDownload} = props;

    const {includeNotes, includeOverrides, reportFormatId, storeAsDefault} =
      state;

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
      dispatch(saveReportComposerDefaults(gmp)(defaults));
    }

    const report_format = reportFormats
      ? reportFormats.find(format => reportFormatId === format.id)
      : undefined;

    const extension = isDefined(report_format)
      ? report_format.extension
      : 'unknown'; // unknown should never happen but we should be save here

    handleInteraction();

    return gmp.auditreport
      .download(entity, {
        reportFormatId,
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
          resourceName: entity.task.name,
          resourceType: 'report',
          username,
        });

        onDownload({filename, data});
      }, handleError);
  };

  const handleFilterCreated = filter => {
    handleInteraction();
    load(filter);
    dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER));
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

    const prev = sorting[name];

    const sortReverse =
      sortField === prev.sortField ? !prev.sortReverse : false;

    const newSorting = {
      ...sorting,
      [name]: {
        sortField,
        sortReverse,
      },
    };
    setSorting(newSorting);
  };

  const handleInteraction = () => dispatch(renewSessionTimeout(gmp)());

  const loadTarget = () => {
    const target = getTarget(entity);
    return gmp.target.get({id: target.id});
  };

  const {reportFilter, showError, showErrorMessage, showSuccessMessage} = props;

  const {report} = entity || {};

  return (
    <React.Fragment>
      <TargetComponent onError={handleError} onInteraction={handleInteraction}>
        {({edit}) => (
          <Page
            activeTab={activeTab}
            audit={true}
            entity={entity}
            entityError={entityError}
            filter={reportFilter}
            filters={filters ? filters : []}
            isLoading={isLoading}
            isUpdating={isUpdating}
            reportId={reportId}
            showError={showError}
            showErrorMessage={showErrorMessage}
            showSuccessMessage={showSuccessMessage}
            sorting={sorting}
            task={isDefined(report) ? report.task : undefined}
            onActivateTab={handleActivateTab}
            onAddToAssetsClick={handleAddToAssets}
            onError={handleError}
            onFilterChanged={handleFilterChange}
            onFilterCreated={handleFilterCreated}
            onFilterDecreaseMinQoDClick={handleFilterDecreaseMinQoD}
            onFilterEditClick={handleFilterEditClick}
            onFilterRemoveClick={handleFilterRemoveClick}
            onFilterResetClick={handleFilterResetClick}
            onInteraction={handleInteraction}
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
        <FilterDialog
          audit={true}
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
          audit={true}
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
    </React.Fragment>
  );
};

DeltaAuditReportDetails.propTypes = {
  defaultFilter: PropTypes.filter,
  location: PropTypes.object.isRequired,
  reload: PropTypes.func.isRequired,
  reportFilter: PropTypes.filter,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  target: PropTypes.model,
  username: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
};

const reloadInterval = report =>
  isDefined(report) && isActive(report.report.scan_run_status)
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : NO_RELOAD; // report doesn't change anymore. no need to reload

const load =
  ({defaultFilter, reportId, deltaReportId, dispatch, gmp, reportFilter}) =>
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
    return dispatch(
      loadDeltaAuditReport(gmp)(reportId, deltaReportId, filter),
    ).then(() =>
      dispatch(loadDeltaAuditReport(gmp)(reportId, deltaReportId, filter)),
    );
  };

const DeltaAuditReportDetailsWrapper = ({defaultFilter, ...props}) => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const params = useParams('/auditreport/delta/:id/:deltaid');

  const {id: reportId, deltaid: deltaReportId} = params;
  const deltaSel = useSelector(deltaAuditReportSelector, shallowEqual);
  const entity = deltaSel.getEntity(reportId, deltaReportId);
  const reportFilter = entity?.report?.filter;

  return (
    <Reload
      load={load({
        ...props,
        dispatch,
        gmp,
        defaultFilter,
        reportFilter,
        reportId,
        deltaReportId,
      })}
      name="auditreport"
      reload={load({
        ...props,
        dispatch,
        gmp,
        defaultFilter,
        reportFilter,
        reportId,
        deltaReportId,
      })}
      reloadInterval={() => reloadInterval(entity)}
    >
      {({reload}) => (
        <DeltaAuditReportDetails
          {...props}
          defaultFilter={defaultFilter}
          reload={reload}
          reportFilter={reportFilter}
        />
      )}
    </Reload>
  );
};

DeltaAuditReportDetailsWrapper.propTypes = {
  defaultFilter: PropTypes.filter,
};

export default compose(
  withDialogNotification,
  withDownload,
)(DeltaAuditReportDetailsWrapper);
