/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useMemo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router';
import logger from 'gmp/log';
import Filter, {
  ALL_FILTER,
  RESET_FILTER,
  RESULTS_FILTER_FILTER,
} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';
import {first} from 'gmp/utils/array';
import {isDefined, hasValue} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import useReload from 'web/hooks/useReload';
import useTranslation from 'web/hooks/useTranslation';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
import DownloadReportDialog from 'web/pages/reports/DownloadReportDialog';
import ReportDetailsFilterDialog from 'web/pages/reports/ReportDetailsFilterDialog';
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

interface UseReportStateParams {
  id?: string;
  deltaid?: string;
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

const useReportDispatch = (gmp, params: UseReportStateParams) => {
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

const useReportState = (params: UseReportStateParams) => {
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

const loadFilteredReport =
  ({reportId, deltaReportId, loadReport, loadReportIfNeeded, reportFilter}) =>
  (filter: Filter) => {
    if (!hasValue(filter)) {
      // use loaded filter after initial loading
      filter = reportFilter;
    }

    if (!hasValue(filter)) {
      // use filter from user setting
      filter = DEFAULT_FILTER;
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

const DeltaReportDetails = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const params = useParams();
  const {
    loadFilters,
    loadTarget,
    saveReportComposerDefaults,
    updateFilter,
    loadReport,
    loadReportIfNeeded,
  } = useReportDispatch(gmp, params);

  const {
    deltaReportId,
    entity,
    entityError,
    filters = [],
    isLoading,
    reportComposerDefaults = {},
    reportFilter,
    reportFormats = [],
    reportConfigs = [],
    reportId = '',
    resultDefaultFilter,
    reportExportFileName,
    username,
  } = useReportState(params);

  const reloadFunc = useMemo(
    () =>
      loadFilteredReport({
        reportId,
        deltaReportId,
        loadReport,
        loadReportIfNeeded,
        reportFilter,
      }),
    [reportId, deltaReportId, reportFilter, loadReport, loadReportIfNeeded],
  );

  const memoizedReloadFn = useCallback(() => {
    const filter = reportFilter ?? resultDefaultFilter ?? DEFAULT_FILTER;
    reloadFunc(filter);
  }, [reloadFunc, reportFilter, resultDefaultFilter]);

  const scanRunStatus = entity?.report?.scan_run_status;
  const timeoutFunc = useCallback(
    ({isVisible}) => {
      if (!isVisible) {
        return NO_RELOAD;
      }
      return isDefined(scanRunStatus) && isActive(scanRunStatus)
        ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
        : NO_RELOAD;
    },
    [scanRunStatus],
  );

  const [startTimer, clearTimer] = useReload(memoizedReloadFn, timeoutFunc);
  const [downloadRef, onDownload] = useDownload();

  const {
    dialogState,
    closeDialog,
    showError,
    showErrorMessage,
    showSuccessMessage,
  } = useDialogNotification();

  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [lastFilter, setLastFilter] = useState<Filter | undefined>();

  const [storeAsDefault] = useState(false);

  const [reportFormatId, setReportFormatId] = useState<string | undefined>();

  const [initialLoaded, setInitialLoaded] = useState(false);

  const reload = useCallback(
    (filter: Filter) => reloadFunc(filter),
    [reloadFunc],
  );

  useEffect(() => {
    if (!initialLoaded) {
      const initialFilter =
        reportFilter ?? resultDefaultFilter ?? DEFAULT_FILTER;
      reloadFunc(initialFilter);
      startTimer();
      setInitialLoaded(true);
    }

    return () => clearTimer();
  }, [
    initialLoaded,
    resultDefaultFilter,
    reportFilter,
    reloadFunc,
    startTimer,
    clearTimer,
  ]);

  useEffect(() => {
    if (!reportFormatId && reportFormats && reportFormats.length > 0) {
      const id = (first(reportFormats) as {id: string} | undefined)?.id;
      if (isDefined(id)) setReportFormatId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFormats]);

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
    if (!entity.id) {
      throw new Error('Entity ID is undefined');
    }

    const filterString = reportFilter?.toFilterString();

    await gmp.report.addAssets({id: entity.id, filter: filterString});
    showSuccessMessage(
      _('Report content added to Assets with QoD>=70% and Overrides enabled.'),
    );
    await handleChanged();
  };

  const handleRemoveFromAssets = async () => {
    if (!entity.id) {
      throw new Error('Entity ID is undefined');
    }

    const filterString = reportFilter?.toFilterString();

    await gmp.report.removeAssets({id: entity.id, filter: filterString});
    showSuccessMessage(_('Report content removed from Assets.'));
    await handleChanged();
  };

  const handleFilterEditClick = () => setShowFilterDialog(true);

  const handleFilterDialogClose = () => setShowFilterDialog(false);

  const handleOpenDownloadReportDialog = () =>
    setShowDownloadReportDialog(true);

  const handleCloseDownloadReportDialog = () =>
    setShowDownloadReportDialog(false);

  const handleReportDownload = async state => {
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

    const extension = report_format?.extension || 'unknown';

    if (!entity.id) {
      throw new Error('Entity ID is undefined');
    }

    try {
      const response = await gmp.report.download(
        {id: entity.id},
        {
          reportConfigId,
          reportFormatId: chosenFormatId,
          deltaReportId,
          filter: newFilter,
        },
      );

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
    } catch (error) {
      handleError(error);
    }
  };

  const handleFilterCreated = (filter: Filter) => {
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
            entityError={entityError as Record<string, unknown> | undefined}
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
              const targetId = entity?.task?.id;
              if (targetId) {
                const response = await loadTarget(targetId);
                edit(response);
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
          onClose={handleFilterDialogClose}
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

export default DeltaReportDetails;
