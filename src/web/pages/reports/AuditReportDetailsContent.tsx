/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import type AuditReport from 'gmp/models/audit-report';
import Filter from 'gmp/models/filter';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {isActive, TASK_STATUS, type TaskStatus} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import ToolBar from 'web/components/bar/Toolbar';
import DateTime from 'web/components/date/DateTime';
import ErrorPanel from 'web/components/error/ErrorPanel';
import {ReportIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Powerfilter from 'web/components/powerfilter/PowerFilter';
import SectionHeader from 'web/components/section/Header';
import Section from 'web/components/section/Section';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import EntityInfo from 'web/entity/EntityInfo';
import EntityTags from 'web/entity/Tags';
import useReportSubEntities from 'web/hooks/use-query/use-report-sub-entities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import AuditThresholdPanel from 'web/pages/reports/details/AuditThresholdPanel';
import ErrorsTab from 'web/pages/reports/details/error/ErrorsTab';
import HostsTabContent from 'web/pages/reports/details/host/HostsTabContent';
import OperatingSystemsTab from 'web/pages/reports/details/operating-system/OperatingSystemsTab';
import ResultsTab from 'web/pages/reports/details/result/ResultsTab';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';
import TLSCertificatesTab from 'web/pages/reports/details/tls-certificate/TlsCertificatesTab';
import ToolBarIcons from 'web/pages/reports/details/ToolbarIcons';

interface AuditReportDetailsContentProps {
  entity?: AuditReport;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  isUpdating?: boolean;
  pageFilter?: Filter;
  reportError?: Error;
  reportFilter?: Filter;
  reportId: string;
  resetFilter?: Filter;
  showError: (...args: unknown[]) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  task?: ReportTask;
  onAddToAssetsClick: () => void;
  onError: (error: Error) => void;
  onFilterChanged: (filter: Filter) => void;
  onFilterCreated: (filter: Filter) => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterResetClick: () => void;
  onRemoveFromAssetsClick: () => void;
  onReportDownloadClick: () => void;
  onTagSuccess: () => void;
  onTargetEditClick: () => void;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
}

const Span = styled.span`
  margin-top: 2px;
`;

const renderWithThreshold = (
  entityType: string,
  config: {
    showInitialLoading: boolean;
    showThresholdMessage: boolean;
    isUpdating: boolean;
    threshold: number;
    reportFilter: Filter;
    onFilterChanged: (filter: Filter) => void;
    onFilterEditClick: () => void;
  },
  content: React.ReactNode,
): React.ReactNode => {
  if (config.showInitialLoading) {
    return <Loading />;
  }
  if (config.showThresholdMessage) {
    return (
      <AuditThresholdPanel
        entityType={entityType}
        filter={config.reportFilter}
        isUpdating={config.isUpdating}
        threshold={config.threshold}
        onFilterChanged={config.onFilterChanged}
        onFilterEditClick={config.onFilterEditClick}
      />
    );
  }
  return content;
};

const AuditReportDetailsContent = ({
  entity,
  filters,
  isLoading = true,
  isLoadingFilters = true,
  isUpdating = false,
  pageFilter,
  reportError,
  reportFilter,
  reportId,
  resetFilter,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
  onAddToAssetsClick,
  onTlsCertificateDownloadClick,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onTagSuccess,
  onTargetEditClick,
}: AuditReportDetailsContentProps) => {
  const hasReport = isDefined(entity);

  const report = hasReport ? entity.report : undefined;
  const hasReportData = hasReport && isDefined(report);

  const userTags = hasReport ? report?.userTags : undefined;
  const userTagsCount = isDefined(userTags) ? userTags.length : 0;
  const gmp = useGmp();
  const [_] = useTranslation();

  const timestamp = report?.timestamp;
  const scan_run_status = report?.scan_run_status;

  const isImport = isDefined(task) && task.isImport();
  const status: TaskStatus = isImport
    ? TASK_STATUS.import
    : ((scan_run_status as TaskStatus) ?? TASK_STATUS.unknown);
  const refetchInterval = isActive(status) ? undefined : false;

  const reportEntities = useReportSubEntities({
    reportId,
    filter: reportFilter,
    refetchInterval,
  });

  if (!hasReport && isDefined(reportError)) {
    return (
      <ErrorPanel
        error={reportError}
        message={_('Error while loading Report {{reportId}}', {reportId})}
      />
    );
  }

  const threshold = gmp.settings.reportResultsThreshold;

  const complianceFiltered = report?.complianceCounts?.filtered ?? 0;
  const showThresholdMessage =
    !isLoading && hasReportData && complianceFiltered > threshold;

  const progress = task?.progress ?? 0;

  const effectiveReportFilter = reportFilter ?? pageFilter ?? new Filter();

  const showIsLoading = isLoading && !hasReport;

  const resultsCounts = report?.complianceCounts
    ? {
        filtered: report.complianceCounts.filtered ?? 0,
        all: report.complianceCounts.full ?? 0,
      }
    : undefined;

  const resultsTabCounts = report?.complianceCounts
    ? {
        filtered: report.complianceCounts.filtered,
        full: report.complianceCounts.full,
      }
    : undefined;

  const showInitialLoading =
    isLoading && !isDefined(reportError) && !showThresholdMessage;

  const thresholdConfig = {
    showInitialLoading,
    showThresholdMessage,
    isUpdating,
    threshold,
    reportFilter: effectiveReportFilter,
    onFilterChanged,
    onFilterEditClick,
  };

  const tabDefs: Array<{
    key: string;
    title: React.ReactNode;
    panel: React.ReactNode;
  }> = [
    {
      key: 'information',
      title: _('Information'),
      panel: (
        <Summary
          audit={true}
          filter={effectiveReportFilter}
          isUpdating={isUpdating}
          report={report as unknown as ReportReport}
          reportError={reportError}
          reportId={reportId}
        />
      ),
    },
    {
      key: 'results',
      title: <TabTitle counts={resultsCounts} title={_('Results')} />,
      panel: (
        <ResultsTab
          audit={true}
          hasTarget={!isImport}
          progress={progress}
          reportFilter={effectiveReportFilter}
          reportId={reportId}
          reportResultsCounts={resultsTabCounts}
          status={status}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onTargetEditClick={onTargetEditClick}
        />
      ),
    },
    {
      key: 'hosts',
      title: (
        <TabTitle
          counts={reportEntities.hosts.data?.entitiesCounts}
          title={_('Hosts')}
        />
      ),
      panel: renderWithThreshold(
        _('Hosts'),
        thresholdConfig,
        <HostsTabContent
          audit={true}
          hostsData={reportEntities.hosts.data}
          isContainerScanning={false}
          isHostsError={reportEntities.hosts.isError}
          isHostsFetching={reportEntities.hosts.isFetching}
          reportFilter={effectiveReportFilter}
          reportId={reportId}
        />,
      ),
    },
    {
      key: 'os',
      title: (
        <TabTitle
          counts={reportEntities.operatingSystems.data?.entitiesCounts}
          title={_('Operating Systems')}
        />
      ),
      panel: renderWithThreshold(
        _('Operating Systems'),
        thresholdConfig,
        <OperatingSystemsTab
          audit={true}
          filter={effectiveReportFilter}
          isOperatingSystemsError={reportEntities.operatingSystems.isError}
          isOperatingSystemsFetching={
            reportEntities.operatingSystems.isFetching
          }
          operatingSystemsData={reportEntities.operatingSystems.data}
          reportId={reportId}
        />,
      ),
    },
    {
      key: 'tlscerts',
      title: (
        <TabTitle
          counts={reportEntities.tlsCertificates.data?.entitiesCounts}
          title={_('TLS Certificates')}
        />
      ),
      panel: renderWithThreshold(
        _('TLS Certificates'),
        thresholdConfig,
        <TLSCertificatesTab
          isTlsCertificatesError={reportEntities.tlsCertificates.isError}
          isTlsCertificatesFetching={reportEntities.tlsCertificates.isFetching}
          reportFilter={effectiveReportFilter}
          reportId={reportId}
          tlsCertificatesData={reportEntities.tlsCertificates.data}
          onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
        />,
      ),
    },
    {
      key: 'errors',
      title: (
        <TabTitle
          counts={reportEntities.errors.data?.entitiesCounts}
          title={_('Error Messages')}
        />
      ),
      panel: (
        <ErrorsTab
          errorsData={reportEntities.errors.data}
          filter={effectiveReportFilter}
          isErrorsError={reportEntities.errors.isError}
          isErrorsFetching={reportEntities.errors.isFetching}
          reportId={reportId}
        />
      ),
    },
    {
      key: 'usertags',
      title: <TabTitle count={userTagsCount} title={_('User Tags')} />,
      panel: (
        <EntityTags
          entity={report}
          onChanged={onTagSuccess}
          onError={onError}
        />
      ),
    },
  ];

  const header_title = (
    <Divider>
      <span>{_('Audit Report:')}</span>
      {showIsLoading ? (
        <span>{_('Loading')}</span>
      ) : (
        <Divider>
          <DateTime date={timestamp} />
          <Span>
            <StatusBar progress={progress} status={status} />
          </Span>
        </Divider>
      )}
    </Divider>
  );

  const header = (
    <SectionHeader img={<ReportIcon size="large" />} title={header_title}>
      {hasReport && <EntityInfo entity={entity} />}
    </SectionHeader>
  );

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <ToolBar>
        <ToolBarIcons
          audit={true}
          delta={false}
          filter={effectiveReportFilter}
          isLoading={showIsLoading}
          report={hasReportData ? report : undefined}
          reportId={reportId}
          showError={showError}
          showErrorMessage={showErrorMessage}
          showSuccessMessage={showSuccessMessage}
          showThresholdMessage={showThresholdMessage}
          task={task}
          threshold={threshold}
          onAddToAssetsClick={onAddToAssetsClick}
          onRemoveFromAssetsClick={onRemoveFromAssetsClick}
          onReportDownloadClick={onReportDownloadClick}
        />
        <Layout align="end">
          <Powerfilter
            createFilterType="result"
            // use loaded filter from report if available otherwise already show the requested filter
            filter={effectiveReportFilter}
            filters={filters}
            isLoading={isLoading || isUpdating}
            isLoadingFilters={isLoadingFilters}
            resetFilter={resetFilter}
            onEditClick={onFilterEditClick}
            onError={onError}
            onFilterCreated={onFilterCreated}
            onRemoveClick={onFilterRemoveClick}
            onResetClick={onFilterResetClick}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section header={header}>
        {showIsLoading ? (
          <Loading />
        ) : (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                {tabDefs.map(tab => (
                  <Tab key={tab.key}>{tab.title}</Tab>
                ))}
              </TabList>
            </TabLayout>

            {hasReportData ? (
              <Tabs>
                <TabPanels>
                  {tabDefs.map(tab => (
                    <TabPanel key={tab.key}>{tab.panel}</TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            ) : (
              <Loading />
            )}
          </TabsContainer>
        )}
      </Section>
    </Layout>
  );
};

export default AuditReportDetailsContent;
