/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useParams} from 'react-router';
import logger from 'gmp/log';
import Filter, {RESET_FILTER} from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import {
  useGetReport,
  useGetReportConfigs,
  useGetReportExportFileName,
  useGetReportFormats,
  useGetResultsFilters,
} from 'web/hooks/use-query/reports';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';
import Page from 'web/pages/reports/DetailsContent';
import DownloadReportDialog from 'web/pages/reports/DownloadReportDialog';
import ReportDetailsFilterDialog from 'web/pages/reports/ReportDetailsFilterDialog';
import TargetComponent from 'web/pages/targets/TargetComponent';
import {create_pem_certificate} from 'web/utils/Cert';
import {generateFilename} from 'web/utils/Render';

interface ReportComposerDefaults {
  defaultReportConfigId?: string;
  defaultReportFormatId?: string;
  includeNotes?: boolean;
  includeOverrides?: boolean;
}

interface DownloadReportState {
  includeNotes: boolean;
  includeOverrides: boolean;
  reportConfigId: string;
  reportFormatId: string;
  storeAsDefault: boolean;
}

interface ReportTargetRef {
  id: string;
}

const log = logger.getLogger('web.pages.reports.DetailsPage');

const DEFAULT_FILTER = Filter.fromString(
  'levels=chml rows=100 min_qod=70 first=1 sort-reverse=severity result_hosts_only=0',
);

export const REPORT_RESET_FILTER = RESET_FILTER.copy()
  .setSortOrder('sort-reverse')
  .setSortBy('severity');

const hasTargetId = (value: unknown): value is ReportTargetRef => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as {id?: unknown}).id === 'string'
  );
};

const getTarget = (entity?: Report) => {
  const report = entity?.report;
  const task = report?.task as {target?: unknown} | undefined;
  const target = task?.target;
  return hasTargetId(target) ? target : undefined;
};

const getReportFilter = (entity?: Report) => {
  return entity?.report?.filter;
};

const ReportDetailsPage = () => {
  const [_] = useTranslation();
  const {id: reportId = ''} = useParams<{id: string}>();
  const gmp = useGmp();
  const queryClient = useQueryClient();
  const username = useUserName();

  const {
    dialogState,
    closeDialog,
    showError,
    showErrorMessage,
    showSuccessMessage,
  } = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();

  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDownloadReportDialog, setShowDownloadReportDialog] =
    useState(false);
  const [reportComposerDefaults, setReportComposerDefaults] =
    useState<ReportComposerDefaults>({});

  // Filter management
  const [pageFilter, , {changeFilter}] = usePageFilter(
    `report-${reportId}`,
    'result',
    {fallbackFilter: DEFAULT_FILTER},
  );

  // Report entity
  const getRefetchInterval = useCallback(
    (entity?: Report) => {
      if (!isDefined(entity) || !isDefined(entity.report)) {
        return false as const;
      }
      return isActive(entity.report.scan_run_status)
        ? gmp.settings.reloadIntervalActive
        : false;
    },
    [gmp.settings.reloadIntervalActive],
  );

  const {
    data: entity,
    error: queryError,
    isError,
    isLoading,
    isFetching,
  } = useGetReport({
    id: reportId,
    filter: pageFilter,
    refetchInterval: getRefetchInterval,
  });

  const reportError = isError ? queryError : undefined;

  const reportFilter = getReportFilter(entity);

  // Filters list for Powerfilter dropdown
  const {data: filtersData, isLoading: isLoadingFilters} =
    useGetResultsFilters();
  const filters = filtersData?.entities ?? [];

  // Report formats for download dialog
  const {data: reportFormatsData} = useGetReportFormats();
  const reportFormats = reportFormatsData?.entities;

  // Report configs for download dialog
  const {data: reportConfigsData} = useGetReportConfigs();
  const reportConfigs = reportConfigsData?.entities ?? [];

  // User settings: report export filename
  const {data: reportExportFileName} = useGetReportExportFileName();

  // Report composer defaults
  useEffect(() => {
    const loadReportComposerDefaults = async () => {
      try {
        const response = await gmp.user.getReportComposerDefaults();
        setReportComposerDefaults(response.data);
      } catch (error) {
        log.error('Error loading report composer defaults', error);
      }
    };

    void loadReportComposerDefaults();
  }, [gmp]);

  // Set initial report format ID from available formats
  useEffect(() => {
    if (isDefined(reportFormats) && reportFormats.length > 0) {
      const reportFormatId = reportFormats[0]?.id;
      if (!isDefined(reportFormatId)) {
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
  }, [reportFormats, _]);

  // Derive counts from report entity
  const report = entity?.report;

  const resultsCounts = report?.result_count;

  const threshold = gmp.settings.reportResultsThreshold;
  const showThresholdMessage =
    isDefined(report) &&
    isDefined(resultsCounts) &&
    (resultsCounts.filtered ?? 0) > threshold;

  // Handlers
  const handleFilterChange = useCallback(
    (filter: Filter) => {
      changeFilter(filter);
    },
    [changeFilter],
  );

  const handleFilterRemoveClick = useCallback(() => {
    handleFilterChange(REPORT_RESET_FILTER);
  }, [handleFilterChange]);

  const handleFilterResetClick = useCallback(() => {
    handleFilterChange(DEFAULT_FILTER);
  }, [handleFilterChange]);

  const handleAddToAssets = useCallback(async () => {
    if (!entity?.id) return;
    try {
      await gmp.report.addAssets({
        id: entity.id,
        filter: reportFilter?.toFilterString(),
      });
      showSuccessMessage(
        _(
          'Report content added to Assets with QoD>=70% and Overrides enabled.',
        ),
      );
      await queryClient.invalidateQueries({queryKey: ['get_report']});
    } catch (error) {
      log.error(error);
      showError(error as Error);
    }
  }, [
    entity,
    gmp,
    reportFilter,
    showSuccessMessage,
    showError,
    queryClient,
    _,
  ]);

  const handleRemoveFromAssets = useCallback(async () => {
    if (!entity?.id) return;
    try {
      await gmp.report.removeAssets({
        id: entity.id,
        filter: reportFilter?.toFilterString(),
      });
      showSuccessMessage(_('Report content removed from Assets.'));
      await queryClient.invalidateQueries({queryKey: ['get_report']});
    } catch (error) {
      log.error(error);
      showError(error as Error);
    }
  }, [
    entity,
    gmp,
    reportFilter,
    showSuccessMessage,
    showError,
    queryClient,
    _,
  ]);

  const handleFilterEditClick = useCallback(() => {
    setShowFilterDialog(true);
  }, []);

  const handleFilterDialogClose = useCallback(() => {
    setShowFilterDialog(false);
  }, []);

  const handleOpenDownloadReportDialog = useCallback(() => {
    setShowDownloadReportDialog(true);
  }, []);

  const handleCloseDownloadReportDialog = useCallback(() => {
    setShowDownloadReportDialog(false);
  }, []);

  const handleReportDownload = useCallback(
    async (values: Record<string, unknown>) => {
      const state = values as unknown as DownloadReportState;
      if (!entity || !reportFilter) return;
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
        try {
          await gmp.user.saveReportComposerDefaults(defaults);
          setReportComposerDefaults(defaults);
        } catch (error) {
          log.error('Error saving report composer defaults', error);
        }
      }

      const reportFormat = reportFormats?.find(
        format => reportFormatId === format.id,
      );

      const extension = isDefined(reportFormat)
        ? reportFormat.extension
        : 'unknown';

      try {
        const response = await gmp.report.download(
          {id: entity.id as string},
          {
            reportConfigId,
            reportFormatId,
            filter: newFilter,
          },
        );
        setShowDownloadReportDialog(false);
        const {data} = response;
        const filename = generateFilename({
          creationTime: entity.creationTime,
          extension,
          fileNameFormat: reportExportFileName,
          id: entity.id as string,
          modificationTime: entity.modificationTime,
          reportFormat: reportFormat?.name,
          resourceName: entity.task?.name,
          resourceType: 'report',
          username,
        });

        handleDownload({filename, data});
      } catch (error) {
        log.error(error);
        showError(error as Error);
      }
    },
    [
      entity,
      gmp,
      handleDownload,
      reportComposerDefaults,
      reportExportFileName,
      reportFilter,
      reportFormats,
      showError,
      username,
    ],
  );

  const handleTlsCertificateDownload = useCallback(
    (cert: ReportTLSCertificate) => {
      if (!cert.data || !cert.serial) return;
      handleDownload({
        filename: 'tls-cert-' + cert.serial + '.pem',
        mimetype: 'application/x-x509-ca-cert',
        data: create_pem_certificate(cert.data),
      });
    },
    [handleDownload],
  );

  const handleFilterCreated = useCallback(
    (filter: Filter) => {
      handleFilterChange(filter);
      void queryClient.invalidateQueries({queryKey: ['get_filters']});
    },
    [handleFilterChange, queryClient],
  );

  const handleFilterAddLogLevel = useCallback(() => {
    if (!reportFilter) return;
    let levels = reportFilter.get('levels', '') as string;

    if (!levels.includes('g')) {
      levels += 'g';
      const levelFilter = reportFilter.copy();
      levelFilter.set('levels', levels);
      handleFilterChange(levelFilter);
    }
  }, [reportFilter, handleFilterChange]);

  const handleFilterRemoveSeverity = useCallback(() => {
    if (!reportFilter) return;

    if (reportFilter.has('severity')) {
      const levelFilter = reportFilter.copy();
      levelFilter.delete('severity');
      handleFilterChange(levelFilter);
    }
  }, [reportFilter, handleFilterChange]);

  const handleFilterDecreaseMinQoD = useCallback(() => {
    if (!reportFilter) return;

    if (reportFilter.has('min_qod')) {
      const levelFilter = reportFilter.copy();
      levelFilter.set('min_qod', 30);
      handleFilterChange(levelFilter);
    }
  }, [reportFilter, handleFilterChange]);

  const handleChanged = useCallback(() => {
    void queryClient.invalidateQueries({queryKey: ['get_report']});
  }, [queryClient]);

  const handleError = useCallback(
    (error: Error) => {
      log.error(error);
      showError(error);
    },
    [showError],
  );

  const loadTarget = useCallback(() => {
    if (!entity) return Promise.resolve();
    const target = getTarget(entity);
    if (!isDefined(target)) return Promise.resolve();
    return gmp.target.get({id: target.id});
  }, [entity, gmp]);

  return (
    <>
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
      <Download ref={downloadRef} />
      <PageTitle title={_('Report Details')} />
      <TargetComponent onSaveError={handleError}>
        {({edit}) => (
          <Page
            entity={entity}
            filters={filters}
            isLoading={isLoading}
            isLoadingFilters={isLoadingFilters}
            isUpdating={isFetching && !isLoading}
            pageFilter={pageFilter}
            reportError={reportError}
            reportFilter={reportFilter}
            reportId={reportId}
            resetFilter={REPORT_RESET_FILTER}
            resultsCounts={resultsCounts}
            showError={showError as (...args: unknown[]) => void}
            showErrorMessage={showErrorMessage}
            showSuccessMessage={showSuccessMessage}
            task={isDefined(report) ? report.task : undefined}
            onAddToAssetsClick={handleAddToAssets}
            onError={handleError}
            onFilterAddLogLevelClick={handleFilterAddLogLevel}
            onFilterChanged={handleFilterChange}
            onFilterDecreaseMinQoDClick={handleFilterDecreaseMinQoD}
            onFilterEditClick={handleFilterEditClick}
            onFilterRemoveClick={handleFilterRemoveClick}
            onFilterRemoveSeverityClick={handleFilterRemoveSeverity}
            onFilterResetClick={handleFilterResetClick}
            onRemoveFromAssetsClick={handleRemoveFromAssets}
            onReportDownloadClick={handleOpenDownloadReportDialog}
            onTagSuccess={handleChanged}
            onTargetEditClick={async () => {
              const response = await loadTarget();
              if (response) void edit(response.data);
            }}
            onTlsCertificateDownloadClick={handleTlsCertificateDownload}
          />
        )}
      </TargetComponent>
      {showFilterDialog && reportFilter && (
        <ReportDetailsFilterDialog
          delta={false}
          filter={reportFilter}
          onClose={handleFilterDialogClose}
          onFilterChanged={handleFilterChange}
          onFilterCreated={handleFilterCreated}
        />
      )}
      {showDownloadReportDialog && reportFilter && (
        <DownloadReportDialog
          defaultReportConfigId={reportComposerDefaults.defaultReportConfigId}
          defaultReportFormatId={reportComposerDefaults.defaultReportFormatId}
          filter={reportFilter}
          includeNotes={reportComposerDefaults.includeNotes}
          includeOverrides={reportComposerDefaults.includeOverrides}
          isContainerScanning={
            isDefined(entity) &&
            isDefined(entity.report?.task?.ociImageTarget?.id)
          }
          reportConfigs={reportConfigs}
          reportFormats={reportFormats ?? []}
          showThresholdMessage={showThresholdMessage}
          threshold={threshold}
          totalResultCount={resultsCounts?.full ?? 0}
          onClose={handleCloseDownloadReportDialog}
          onSave={handleReportDownload}
        />
      )}
    </>
  );
};

export default ReportDetailsPage;
