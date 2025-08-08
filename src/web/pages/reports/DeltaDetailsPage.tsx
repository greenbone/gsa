/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router';
import logger from 'gmp/log';
import Filter, {
  ALL_FILTER,
  RESET_FILTER,
  RESULTS_FILTER_FILTER,
} from 'gmp/models/filter';
import Report from 'gmp/models/report';
import Target from 'gmp/models/target';
import {isActive} from 'gmp/models/task';
import {first} from 'gmp/utils/array';
import {isDefined, hasValue} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
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
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
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
import {generateFilename} from 'web/utils/Render';
import {DESC} from 'web/utils/SortDirection';

interface DeltaReportDetailsWrapperProps {
  defaultFilter?: Filter;
  reportFilter?: Filter;
  entity?: Report;
}

interface DeltaReportDetailsProps {
  deltaReportId: string;
  entity: Report;
  entityError?: unknown;
  filters?: Filter[];
  isLoading: boolean;
  reportComposerDefaults?: {
    defaultReportConfigId?: string;
    defaultReportFormatId?: string;
    includeNotes?: boolean;
    includeOverrides?: boolean;
  };
  reportExportFileName?: string;
  reportFilter?: Filter;
  reportFormats?: Array<{
    id: string;
    name: string;
    extension: string;
  }>;
  reportConfigs?: Array<{
    id: string;
    name: string;
  }>;
  reportId: string;
  resultDefaultFilter?: Filter;
  defaultReportConfigId?: string;
  defaultReportFormatId?: string;
  includeNotes?: boolean;
  includeOverrides?: boolean;
  username?: string;
  loadFilters: () => void;
  loadReportComposerDefaults: () => void;
  loadReportConfigs: () => void;
  loadReportFormats: () => void;
  loadSettings: () => void;
  loadTarget: (targetId: string) => Promise<Target>;
  reload: (filter: Filter) => Promise<void>;
  saveReportComposerDefaults: (defaults: {}) => void;
  updateFilter: (filter: Filter) => void;
}

const log = logger.getLogger('web.pages.report.deltadetailspage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity',
);

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

const getFilter = (
  entity: {report?: {filter?: Filter}} = {},
): Filter | undefined => {
  const {report = {}} = entity;
  return report.filter;
};

const DeltaReportDetails = ({
  deltaReportId,
  entity,
  entityError,
  filters = [],
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
  updateFilter,
  username,
}: DeltaReportDetailsProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [downloadRef, onDownload] = useDownload();

  const {
    dialogState,
    closeDialog,
    showError,
    showErrorMessage,
    showSuccessMessage,
  } = useDialogNotification();

  // State

  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [lastFilter, setLastFilter] = useState<Filter | undefined>();

  const [storeAsDefault] = useState(false);

  const [reportFormatId, setReportFormatId] = useState<string | undefined>();

  // Initial load
  useEffect(() => {
    loadSettings();
    loadFilters();
    loadReportConfigs();
    loadReportFormats();
    loadReportComposerDefaults();
  }, [
    loadFilters,
    loadReportComposerDefaults,
    loadReportConfigs,
    loadReportFormats,
    loadSettings,
  ]);

  // Set initial reportFormatId if available
  useEffect(() => {
    if (!reportFormatId && reportFormats && reportFormats.length > 0) {
      const id = (first(reportFormats) as {id: string} | undefined)?.id;
      if (isDefined(id)) setReportFormatId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFormats]);

  // Reload on id change
  useEffect(() => {
    setIsUpdating(false);
    setLastFilter(undefined);
  }, [reportId, deltaReportId]);

  // Load function

  const load = async (filter?: Filter) => {
    log.debug('Loading delta report', {filter});
    setIsUpdating(isDefined(lastFilter) && !lastFilter?.equals?.(filter));
    setLastFilter(filter);
    const usedFilter = filter ?? DEFAULT_FILTER;
    await reload(usedFilter);
    return setIsUpdating(false);
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

  const handleAddToAssets = async () => {
    await gmp.report.addAssets(entity, {filter: reportFilter});
    showSuccessMessage(
      _('Report content added to Assets with QoD>=70% and Overrides enabled.'),
    );
    await handleChanged();
  };

  const handleRemoveFromAssets = async () => {
    await gmp.report.removeAssets(entity, {filter: reportFilter});
    showSuccessMessage(_('Report content removed from Assets.'));
    await handleChanged();
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

    const baseFilter = reportFilter ?? DEFAULT_FILTER;
    const newFilter = baseFilter.copy();

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
    void load(filter);
    loadFilters();
  };

  const handleFilterAddLogLevel = () => {
    if (!reportFilter) return;
    let levels = reportFilter.get('levels', '');
    const levelsStr = String(levels);
    if (!levelsStr.includes('g')) {
      const newLevels = levelsStr + 'g';

      const copiedReportFilter = reportFilter.copy();
      copiedReportFilter.set('levels', newLevels);
      void load(copiedReportFilter);
    }
  };

  const handleFilterRemoveSeverity = () => {
    if (reportFilter?.has('severity')) {
      const copiedReportFilter = reportFilter.copy();
      copiedReportFilter.delete('severity');
      void load(copiedReportFilter);
    }
  };

  const handleFilterDecreaseMinQoD = () => {
    if (reportFilter?.has('min_qod')) {
      const copiedReportFilter = reportFilter.copy();
      copiedReportFilter.set('min_qod', 30);
      void load(copiedReportFilter);
    }
  };

  const [currentSortingField, sortDirection, handleSortChangeRaw] =
    useFilterSortBy(reportFilter ?? DEFAULT_FILTER, async filter => {
      await load(filter);
      updateFilter(filter);
    });

  const isCurrentSortReverse = sortDirection === DESC;

  const handleSortChange = (_, sortField) => {
    if (!sortField || typeof sortField !== 'string') return;
    handleSortChangeRaw(sortField);
  };

  const {report} = entity || {};

  return (
    <>
      <TargetComponent>
        {({edit}) => (
          <DeltaDetailsContent
            entity={entity}
            entityError={entityError as object | null | undefined}
            filter={reportFilter}
            filters={filters}
            isLoading={isLoading}
            isUpdating={isUpdating}
            reportId={reportId}
            showError={showError}
            showErrorMessage={showErrorMessage}
            showSuccessMessage={showSuccessMessage}
            sortField={currentSortingField || 'severity'}
            sortReverse={isCurrentSortReverse}
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
            onTargetEditClick={async () => {
              const targetId = entity?.task?.id; // Assuming entity.task.id contains the targetId
              if (targetId) {
                const response = await loadTarget(targetId);
                edit(response); // Directly pass the response object
              } else {
                console.error('Target ID is missing');
              }
            }}
          />
        )}
      </TargetComponent>
      {showFilterDialog && (
        <ReportDetailsFilterDialog
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
          includeNotes={Number(reportComposerDefaults.includeNotes)}
          includeOverrides={Number(reportComposerDefaults.includeOverrides)}
          reportConfigs={reportConfigs}
          reportFormats={reportFormats}
          storeAsDefault={storeAsDefault}
          onClose={handleCloseDownloadReportDialog}
          onSave={handleReportDownload}
        />
      )}
      <Download ref={downloadRef} />
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
    </>
  );
};

const useReportDispatch = (gmp, params) => {
  const dispatch = useDispatch();

  const getReportPageName = id => `delta-report-${id}`;
  return useMemo(
    () => ({
      loadFilters: () =>
        // @ts-expect-error
        dispatch(loadFilters(gmp)(RESULTS_FILTER_FILTER)),
      loadSettings: () =>
        // @ts-expect-error
        dispatch(loadUserSettingDefaults(gmp)()),
      loadTarget: targetId => gmp.target.get({id: targetId}),
      loadReportConfigs: () =>
        // @ts-expect-error
        dispatch(loadReportConfigs(gmp)(ALL_FILTER)),
      loadReportFormats: () =>
        // @ts-expect-error
        dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
      loadReport: (id, deltaId, filter) =>
        // @ts-expect-error
        dispatch(loadDeltaReport(gmp)(id, deltaId, filter)),
      loadReportIfNeeded: (id, deltaId, filter) =>
        // @ts-expect-error
        dispatch(loadDeltaReport(gmp)(id, deltaId, filter)),
      loadReportComposerDefaults: () =>
        // @ts-expect-error
        dispatch(loadReportComposerDefaults(gmp)()),
      loadUserSettingDefaultFilter: () =>
        // @ts-expect-error
        dispatch(loadUserSettingsDefaultFilter(gmp)('result')),
      saveReportComposerDefaults: reportComposerDefaults =>
        // @ts-expect-error
        dispatch(saveReportComposerDefaults(gmp)(reportComposerDefaults)),
      updateFilter: f => {
        return dispatch(setPageFilter(getReportPageName(params.id), f));
      },
    }),
    [dispatch, gmp, params.id],
  );
};

const useReportState = params => {
  const {id, deltaid} = params || {};

  const filterSel = useSelector(state => filterSelector(state));

  const deltaSel = useSelector(state => deltaReportSelector(state));

  const reportFormatsSel = useSelector(state => reportFormatsSelector(state));

  const reportConfigsSel = useSelector(state => reportConfigsSelector(state));

  const userDefaultsSelector = useSelector(state =>
    getUserSettingsDefaults(state),
  );

  const userDefaultFilterSel = useSelector(state =>
    getUserSettingsDefaultFilter(state, 'result'),
  );

  const username = useSelector(state => {
    return getUsername(state);
  });

  const entity = useSelector(() => deltaSel.getEntity(id, deltaid));

  const entityError = useSelector(() => deltaSel.getError(id, deltaid));

  const reportComposerDefaults = useSelector(state =>
    getReportComposerDefaults(state),
  );

  // Use useMemo to memoize the returned object
  return useMemo(
    () => ({
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
      reportComposerDefaults,
      resultDefaultFilter: userDefaultFilterSel.getFilter('result'),
      username,
    }),
    [
      deltaid,
      entity,
      entityError,
      filterSel,
      id,
      reportComposerDefaults,
      reportConfigsSel,
      reportFormatsSel,
      userDefaultFilterSel,
      userDefaultsSelector,
      username,
    ],
  );
};

const reloadInterval = report =>
  isDefined(report) && isActive(report.report.scan_run_status)
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : NO_RELOAD;

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

    // Ensure the filter respects the sortField set by the user
    if (!filter.has('sort') && !filter.has('sort-reverse')) {
      filter.set('sort', 'name');
    }

    return loadReportIfNeeded(reportId, deltaReportId, filter).then(() =>
      loadReport(reportId, deltaReportId, filter),
    );
  };

const DeltaReportDetailsWrapper = ({
  defaultFilter,
  reportFilter,
  ...props
}: DeltaReportDetailsWrapperProps) => {
  const gmp = useGmp();

  const params = useParams();

  const dispatchProps = useReportDispatch(gmp, params);

  const stateProps = useReportState(params);

  const stableProps = props;

  const loadFunc = useMemo(
    () =>
      load({
        ...stableProps,
        ...dispatchProps,
        ...stateProps,
        defaultFilter,
      }),
    [stableProps, dispatchProps, stateProps, defaultFilter],
  );

  const reloadFunc = useMemo(
    () =>
      load({
        ...stableProps,
        ...dispatchProps,
        ...stateProps,
        defaultFilter,
        reportFilter,
      }),
    [stableProps, dispatchProps, stateProps, defaultFilter, reportFilter],
  );

  return (
    <Reload
      load={loadFunc}
      name="report"
      reload={reloadFunc}
      reloadInterval={() => reloadInterval(stateProps.entity)}
    >
      {({reload}) => (
        <DeltaReportDetails
          {...stableProps}
          {...dispatchProps}
          {...stateProps}
          reload={reload}
          reportFilter={reportFilter || stateProps.reportFilter}
        />
      )}
    </Reload>
  );
};

export default DeltaReportDetailsWrapper;
