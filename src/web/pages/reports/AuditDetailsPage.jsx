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
import PageTitle from 'web/components/layout/PageTitle';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import withDialogNotification from 'web/components/notification/withDialogNotifiaction';
import FilterProvider from 'web/entities/FilterProvider';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import Page from 'web/pages/reports/AuditDetailsContent';
import FilterDialog from 'web/pages/reports/DetailsFilterDialog';
import DownloadReportDialog from 'web/pages/reports/DownloadReportDialog';
import TargetComponent from 'web/pages/targets/Component';
import {
  loadAllEntities as loadFilters,
  selector as filterSelector,
} from 'web/store/entities/filters';
import {loadAuditReportWithThreshold} from 'web/store/entities/report/actions';
import {auditReportSelector} from 'web/store/entities/report/selectors';
import {
  loadAllEntities as loadReportConfigs,
  selector as reportConfigsSelector,
} from 'web/store/entities/reportconfigs';
import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
import getPage from 'web/store/pages/selectors';
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
import {create_pem_certificate} from 'web/utils/Cert';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';


const log = logger.getLogger('web.pages.auditreport./DetailsPage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=hmlg rows=100 min_qod=70 first=1 compliance_levels=yniu sort=compliant',
);

export const AUDIT_REPORT_RESET_FILTER = RESET_FILTER.copy()
  .setSortOrder('sort')
  .setSortBy('compliant');

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

const getReportPageName = id => `report-${id}`;

const getTarget = (entity = {}) => {
  const {report = {}} = entity;
  const {task = {}} = report;
  return task.target;
};

const ReportDetails = props => {
  const [activeTab, setActiveTab] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);
  const [sorting, setSorting] = useState({
    results: {
      sortField: 'compliant',
      sortReverse: true,
    },
    hosts: {
      sortField: 'compliant',
      sortReverse: true,
    },
    os: {
      sortField: 'compliant',
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
  });

  const [entity, setEntity] = useState();
  const [resultsCounts, setResultsCounts] = useState();
  const [hostsCounts, setHostsCounts] = useState();
  const [operatingSystemsCounts, setOperatingSystemsCounts] = useState();
  const [tlsCertificatesCounts, setTlsCertificatesCounts] = useState();
  const [reportFormatId, setReportFormatId] = useState();
  const [errorsCounts, setErrorsCounts] = useState();
  const [reportFilter, setReportFilter] = useState();
  const [isUpdating, setIsUpdating] = useState(false);
  // storeAsDefault is set in SaveDialogContent
  // eslint-disable-next-line no-unused-vars
  const [storeAsDefault, setStoreAsDefault] = useState();

  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const params = useParams('/audit/:id');
  const {id: reportId} = params;

  const pSelector = useSelector(getPage, shallowEqual);
  const pageFilter = pSelector?.getFilter(getReportPageName(reportId));

  const [selectedEntity, reportError, isLoading] = useSelector(state => {
    const reportSel = auditReportSelector(state);
    return [
      reportSel?.getEntity(reportId, pageFilter),
      reportSel?.getEntityError(reportId, pageFilter),
      reportSel?.isLoadingEntity(reportId, pageFilter),
    ];
  }, shallowEqual);

  const userDefaultsSelector = useSelector(
    getUserSettingsDefaults,
    shallowEqual,
  );
  const reportExportFileName = userDefaultsSelector?.getValueByName(
    'reportexportfilename',
  );

  const reportFormatsSel = useSelector(reportFormatsSelector);
  const reportConfigsSel = useSelector(reportConfigsSelector);
  const reportFormats = reportFormatsSel?.getAllEntities(REPORT_FORMATS_FILTER);
  const reportConfigs = reportConfigsSel?.getAllEntities(ALL_FILTER);
  const reportComposerDefaults = useSelector(getReportComposerDefaults);
  const userDefaultFilterSel = useSelector(
    rootState => getUserSettingsDefaultFilter(rootState, 'result'),
    shallowEqual,
  );
  const resultDefaultFilter = userDefaultFilterSel?.getFilter();
  const username = useSelector(getUsername);

  useEffect(() => {
    dispatch(loadUserSettingDefaults(gmp)());
    dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER));
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER));
    dispatch(loadReportConfigs(gmp)(ALL_FILTER));
    dispatch(loadReportComposerDefaults(gmp)());

    if (isDefined(selectedEntity)) {
      setEntity(entity);
      updateReportCounts(selectedEntity);
      setReportFilter(props.reportFilter);
      setIsUpdating(false);
    } else {
      setIsUpdating(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDefined(selectedEntity)) {
      // update only if a new report is available to avoid having no report
      // when the filter changes
      setEntity(selectedEntity);
      updateReportCounts(selectedEntity);
      setReportFilter(props.reportFilter);
      setIsUpdating(false);
    } else {
      // report is not in the store and is currently loaded
      setIsUpdating(true);
    }
  }, [selectedEntity, props.reportFilter]);

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
  }, [reportId]);

  const updateReportCounts = reportEntity => {
    const {report = {}} = reportEntity;
    const {
      results = {},
      hosts = {},
      operatingSystems = {},
      tlsCertificates = {},
      errors = {},
    } = report;

    if (isDefined(results.counts)) {
      setResultsCounts(results.counts);
    }
    if (isDefined(hosts.counts)) {
      setHostsCounts(hosts.counts);
    }
    if (isDefined(operatingSystems.counts)) {
      setOperatingSystemsCounts(operatingSystems.counts);
    }
    if (isDefined(tlsCertificates.counts)) {
      setTlsCertificatesCounts(tlsCertificates.counts);
    }
    if (isDefined(errors.counts)) {
      setErrorsCounts(errors.counts);
    }
  };

  const load = newFilter => {
    log.debug('Loading report', {
      newFilter,
    });
    const {reportFilter: filter} = props;

    setIsUpdating(!isDefined(filter) || !filter.equals(newFilter)); // show update indicator if filter has changed

    props
      .reload(newFilter)
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
    handleFilterChange(AUDIT_REPORT_RESET_FILTER);
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

    gmp.auditreport.addAssets(selectedEntity, {filter}).then(() => {
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

    gmp.auditreport.removeAssets(selectedEntity, {filter}).then(() => {
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
    const {reportFilter: filter, onDownload} = props;

    const {
      includeNotes,
      includeOverrides,

      reportFormatId,

      storeAsDefault,
    } = state;

    const newFilter = filter.copy();
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
      .download(selectedEntity, {
        reportFormatId,
        filter: newFilter,
      })
      .then(response => {
        setShowDownloadReportDialog(false);
        const {data} = response;
        const filename = generateFilename({
          creationTime: selectedEntity.creationTime,
          extension,
          fileNameFormat: reportExportFileName,
          id: selectedEntity.id,
          modificationTime: selectedEntity.modificationTime,
          reportFormat: report_format?.name,
          resourceName: selectedEntity.task.name,
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
    dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER));
  };

  const handleFilterDecreaseMinQoD = () => {
    const {reportFilter: filter} = props;

    handleInteraction();

    if (filter.has('min_qod')) {
      const lfilter = filter.copy();
      lfilter.set('min_qod', 30);
      load(lfilter);
    }
  };

  const handleSortChange = (name, sortField) => {
    handleInteraction();

    const prev = sorting[name];

    const sortReverse =
      sortField === prev.sortField ? !prev.sortReverse : false;

    const newSort = {
      ...sorting,
      [name]: {
        sortField,
        sortReverse,
      },
    };
    setSorting(newSort);
  };

  const handleInteraction = () => dispatch(renewSessionTimeout(gmp)());

  const loadTarget = () => {
    const target = getTarget(selectedEntity);
    return gmp.target.get({id: target.id});
  };

  const {showError, showErrorMessage, showSuccessMessage} = props;

  const report = isDefined(entity) ? entity.report : undefined;

  const threshold = gmp.settings.reportResultsThreshold;

  const showThresholdMessage =
    isDefined(report) && report.results.counts.filtered > threshold;

  const [filters, isLoadingFilters] = useSelector(state => {
    const filterSel = filterSelector(state);
    return [
      filterSel?.getAllEntities(RESULTS_FILTER_FILTER),
      filterSel?.isLoadingAllEntities(RESULTS_FILTER_FILTER),
    ];
  });

  return (
    <React.Fragment>
      <PageTitle title={_('Report Details')} />
      <TargetComponent onError={handleError} onInteraction={handleInteraction}>
        {({edit}) => (
          <Page
            activeTab={activeTab}
            audit={true}
            entity={entity}
            errorsCounts={errorsCounts}
            filters={filters ? filters : []}
            hostsCounts={hostsCounts}
            isLoading={isLoading}
            isLoadingFilters={isLoadingFilters}
            isUpdating={isUpdating}
            operatingSystemsCounts={operatingSystemsCounts}
            pageFilter={pageFilter}
            reportError={reportError}
            reportFilter={reportFilter}
            reportId={reportId}
            resetFilter={AUDIT_REPORT_RESET_FILTER}
            resultsCounts={resultsCounts}
            showError={showError}
            showErrorMessage={showErrorMessage}
            showSuccessMessage={showSuccessMessage}
            sorting={sorting}
            task={isDefined(report) ? report.task : undefined}
            tlsCertificatesCounts={tlsCertificatesCounts}
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
            onTlsCertificateDownloadClick={handleTlsCertificateDownload}
          />
        )}
      </TargetComponent>
      {showFilterDialog && (
        <FilterDialog
          audit={true}
          createFilterType="result"
          delta={false}
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
  ({
    defaultFilter,
    reportId,

    dispatch,
    gmp,
    params,
    pageFilter,
    reportFilter,
  }) =>
  filter => {
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
    dispatch(setPageFilter(getReportPageName(params.id), filter));
    return dispatch(loadAuditReportWithThreshold(gmp)(reportId, {filter}));
  };

const ReportDetailsWrapper = props => {
  const dispatch = useDispatch();
  const gmp = useGmp();
  const params = useParams();

  const {id: reportId} = params;
  const reportSel = useSelector(auditReportSelector, shallowEqual);
  const pSelector = useSelector(getPage, shallowEqual);

  const pageFilter = pSelector.getFilter(getReportPageName(reportId));
  const entity = reportSel.getEntity(reportId, pageFilter);
  const reportFilter = entity?.report?.filter;

  return (
    <FilterProvider
      fallbackFilter={DEFAULT_FILTER}
      gmpname="result"
      pageName={`report-${reportId}`}
    >
      {({filter}) => (
        <Reload
          load={load({
            ...props,
            dispatch,
            gmp,
            params,
            defaultFilter: filter,
            reportFilter,
            reportId,
            pageFilter,
          })}
          name={`report-${reportId}`}
          reload={load({
            ...props,
            dispatch,
            gmp,
            params,
            defaultFilter: filter,
            reportFilter,
            reportId,
            pageFilter,
          })}
          reloadInterval={() => reloadInterval(entity)}
        >
          {({reload}) => (
            <ReportDetails
              {...props}
              defaultFilter={filter}
              reload={reload}
              reportFilter={reportFilter}
            />
          )}
        </Reload>
      )}
    </FilterProvider>
  );
};

export default compose(
  withDialogNotification,
  withDownload,
)(ReportDetailsWrapper);
