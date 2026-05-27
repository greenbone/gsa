/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import DateTime from 'web/components/date/DateTime';
import ErrorPanel from 'web/components/error/ErrorPanel';
import {ReportIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
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
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ApplicationsTab from 'web/pages/reports/details/ApplicationsTab';
import ClosedCvesTab from 'web/pages/reports/details/ClosedCvesTab';
import CvesTab from 'web/pages/reports/details/CvesTab';
import DetailsToolbar from 'web/pages/reports/details/DetailsToolbar';
import ErrorsTab from 'web/pages/reports/details/ErrorsTab';
import HostsTabContent from 'web/pages/reports/details/HostsTabContent';
import OperatingSystemsTab from 'web/pages/reports/details/OperatingSystemsTab';
import PortsTab from 'web/pages/reports/details/PortsTab';
import ResultsTabContent from 'web/pages/reports/details/ResultsTabContent';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';
import ThresholdPanel from 'web/pages/reports/details/ThresholdPanel';
import TLSCertificatesTab from 'web/pages/reports/details/TlsCertificatesTab';

interface ThresholdConfig {
  showInitialLoading: boolean;
  showThresholdMessage: boolean;
  isUpdating: boolean;
  threshold: number;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
}

interface SortingEntry {
  sortField: string;
  sortReverse: boolean;
}

interface SortingData {
  apps: SortingEntry;
  cves: SortingEntry;
  errors: SortingEntry;
  hosts: SortingEntry;
  os: SortingEntry;
  closedcves: SortingEntry;
  tlscerts: SortingEntry;
}

interface TabDefinition {
  key: string;
  renderTab: () => React.ReactNode;
  renderPanel: () => React.ReactNode;
}

interface PageContentProps {
  applicationsCounts?: CollectionCounts;
  closedCvesCounts?: CollectionCounts;
  cvesCounts?: CollectionCounts;
  entity?: Report;
  errorsCounts?: CollectionCounts;
  filters?: Filter[];
  hostsCounts?: CollectionCounts;
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  isUpdating?: boolean;
  operatingSystemsCounts?: CollectionCounts;
  pageFilter?: Filter;
  portsCounts?: CollectionCounts;
  reportError?: Error;
  reportFilter?: Filter;
  reportId: string;
  resetFilter?: Filter;
  resultsCounts?: CollectionCounts;
  showError: (...args: unknown[]) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  sorting: SortingData;
  task?: ReportTask;
  tlsCertificatesCounts?: CollectionCounts;
  onAddToAssetsClick: () => void;
  onError: (error: Error) => void;
  onFilterAddLogLevelClick: () => void;
  onFilterChanged: (filter: Filter) => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick: () => void;
  onFilterResetClick: () => void;
  onRemoveFromAssetsClick: () => void;
  onReportDownloadClick: () => void;
  onSortChange: (type: string, sortField: string) => void;
  onTagSuccess: () => void;
  onTargetEditClick: () => void;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
}

const renderWithThreshold = (
  entityType: string,
  activeFilter: Filter,
  config: ThresholdConfig,
  content: React.ReactNode,
): React.ReactNode => {
  if (config.showInitialLoading) {
    return <Loading />;
  }
  if (config.showThresholdMessage) {
    return (
      <ThresholdPanel
        entityType={entityType}
        filter={activeFilter}
        isUpdating={config.isUpdating}
        threshold={config.threshold}
        onFilterChanged={config.onFilterChanged}
        onFilterEditClick={config.onFilterEditClick}
      />
    );
  }
  return content;
};

const Span = styled.span`
  margin-top: 2px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  white-space: normal;
  word-break: normal;
  word-wrap: break-word;
`;

const PageContent = ({
  applicationsCounts,
  closedCvesCounts,
  cvesCounts,
  entity,
  errorsCounts,
  filters,
  hostsCounts,
  isLoading = true,
  isLoadingFilters = true,
  isUpdating = false,
  operatingSystemsCounts,
  pageFilter,
  portsCounts,
  reportError,
  reportFilter,
  reportId,
  resetFilter,
  resultsCounts,
  sorting,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
  tlsCertificatesCounts,
  onAddToAssetsClick,
  onTlsCertificateDownloadClick,
  onError,
  onFilterAddLogLevelClick,
  onFilterChanged,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveSeverityClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onSortChange,
  onTagSuccess,
  onTargetEditClick,
}: PageContentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const hasReport = isDefined(entity);
  const report = entity?.report;

  const isContainerScanning =
    hasReport && isDefined(entity.report?.task?.ociImageTarget?.id);
  const isAgentScanning =
    hasReport && isDefined(entity.report?.task?.agentGroup?.id);

  const userTagsCount = report?.userTags?.length ?? 0;

  const {results, timestamp, scan_run_status} = report ?? {};

  if (!hasReport && isDefined(reportError)) {
    return (
      <ErrorPanel
        error={reportError}
        message={_('Error while loading Report {{reportId}}', {reportId})}
      />
    );
  }

  const threshold = gmp.settings.reportResultsThreshold;

  const showThresholdMessage =
    !isLoading && hasReport && (results?.counts?.filtered ?? 0) > threshold;

  const isImport = isDefined(task) && task.isImport();
  const status = isImport
    ? TASK_STATUS.import
    : (scan_run_status ?? TASK_STATUS.unknown);
  const progress = task?.progress ?? 0;

  const showIsLoading = isLoading && !hasReport;

  const showInitialLoading =
    isLoading &&
    !isDefined(reportError) &&
    !showThresholdMessage &&
    (!isDefined(results?.entities) || results.entities.length === 0);

  const HeaderTitle = (
    <Divider>
      <span style={{whiteSpace: 'nowrap'}}>{_('Report:')}</span>
      {showIsLoading ? (
        <span>{_('Loading')}</span>
      ) : (
        <HeaderContainer>
          <DateTime showTimezoneAsSeparateLine date={timestamp} />
          <Span>
            <StatusBar progress={progress} status={status} />
          </Span>
        </HeaderContainer>
      )}
    </Divider>
  );

  const header = (
    <SectionHeader
      alignHeading={['start', 'baseline']}
      img={<ReportIcon size="large" />}
      title={HeaderTitle}
    >
      {hasReport && <EntityInfo entity={entity} />}
    </SectionHeader>
  );

  const thresholdConfig: ThresholdConfig = {
    showInitialLoading,
    showThresholdMessage,
    isUpdating,
    threshold,
    onFilterChanged,
    onFilterEditClick,
  };

  const buildTabDefinitions = (
    activeReport: ReportReport,
    activeFilter: Filter,
  ): TabDefinition[] => [
    {
      key: 'information',
      renderTab: () => _('Information'),
      renderPanel: () => (
        <Summary
          filter={activeFilter}
          isUpdating={isUpdating}
          report={activeReport}
          reportError={reportError}
          reportId={reportId}
        />
      ),
    },
    {
      key: 'results',
      renderTab: () => <TabTitle counts={resultsCounts} title={_('Results')} />,
      renderPanel: () => (
        <ResultsTabContent
          hasTarget={!isImport}
          isContainerScanning={isContainerScanning}
          progress={progress}
          reportFilter={activeFilter}
          reportId={reportId}
          reportResultsCounts={resultsCounts}
          status={status}
          onFilterAddLogLevelClick={onFilterAddLogLevelClick}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
          onTargetEditClick={onTargetEditClick}
        />
      ),
    },
    {
      key: 'hosts',
      renderTab: () => <TabTitle counts={hostsCounts} title={_('Hosts')} />,
      renderPanel: () =>
        renderWithThreshold(
          _('Hosts'),
          activeFilter,
          thresholdConfig,
          <HostsTabContent
            isAgentScanning={isAgentScanning}
            isContainerScanning={isContainerScanning}
            reportFilter={activeFilter}
            reportId={reportId}
            status={status}
          />,
        ),
    },
    {
      key: 'ports',
      renderTab: () => <TabTitle counts={portsCounts} title={_('Ports')} />,
      renderPanel: () => (
        <PortsTab reportFilter={activeFilter} reportId={reportId} />
      ),
    },
    {
      key: 'applications',
      renderTab: () => (
        <TabTitle counts={applicationsCounts} title={_('Applications')} />
      ),
      renderPanel: () =>
        renderWithThreshold(
          _('Applications'),
          activeFilter,
          thresholdConfig,
          <ApplicationsTab
            filter={activeFilter}
            reportId={reportId}
            status={status}
          />,
        ),
    },
    {
      key: 'os',
      renderTab: () => (
        <TabTitle
          counts={operatingSystemsCounts}
          title={_('Operating Systems')}
        />
      ),
      renderPanel: () =>
        renderWithThreshold(
          _('Operating Systems'),
          activeFilter,
          thresholdConfig,
          <OperatingSystemsTab
            filter={activeFilter}
            reportId={reportId}
            status={status}
          />,
        ),
    },
    {
      key: 'cves',
      renderTab: () => <TabTitle counts={cvesCounts} title={_('CVEs')} />,
      renderPanel: () =>
        renderWithThreshold(
          _('CVEs'),
          activeFilter,
          thresholdConfig,
          <CvesTab filter={activeFilter} reportId={reportId} status={status} />,
        ),
    },
    {
      key: 'closedcves',
      renderTab: () => (
        <TabTitle counts={closedCvesCounts} title={_('Closed CVEs')} />
      ),
      renderPanel: () =>
        renderWithThreshold(
          _('Closed CVEs'),
          activeFilter,
          thresholdConfig,
          <ClosedCvesTab
            filter={activeFilter}
            reportId={reportId}
            status={status}
          />,
        ),
    },
    {
      key: 'tlscerts',
      renderTab: () => (
        <TabTitle
          counts={tlsCertificatesCounts}
          title={_('TLS Certificates')}
        />
      ),
      renderPanel: () =>
        renderWithThreshold(
          _('TLS Certificates'),
          activeFilter,
          thresholdConfig,
          <TLSCertificatesTab
            reportFilter={activeFilter}
            reportId={reportId}
            status={status}
            onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
          />,
        ),
    },
    {
      key: 'errors',
      renderTab: () => (
        <TabTitle counts={errorsCounts} title={_('Error Messages')} />
      ),
      renderPanel: () => (
        <ErrorsTab filter={activeFilter} reportId={reportId} status={status} />
      ),
    },
    {
      key: 'usertags',
      renderTab: () => (
        <TabTitle count={userTagsCount} title={_('User Tags')} />
      ),
      renderPanel: () => (
        <EntityTags
          entity={activeReport}
          onChanged={onTagSuccess}
          onError={onError}
        />
      ),
    },
  ];

  const tabDefinitions =
    isDefined(report) && isDefined(reportFilter)
      ? buildTabDefinitions(report, reportFilter)
      : [];

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <DetailsToolbar
        delta={false}
        filters={filters}
        isLoading={showIsLoading}
        isLoadingFilters={isLoadingFilters}
        isUpdating={isUpdating}
        pageFilter={pageFilter}
        report={report}
        reportFilter={reportFilter}
        reportId={reportId}
        resetFilter={resetFilter}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        showThresholdMessage={showThresholdMessage}
        task={task}
        threshold={threshold}
        onAddToAssetsClick={onAddToAssetsClick}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterResetClick={onFilterResetClick}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
      />

      <Section header={header}>
        {showIsLoading ? (
          <Loading />
        ) : (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                {tabDefinitions.map(tab => (
                  <Tab key={tab.key}>{tab.renderTab()}</Tab>
                ))}
              </TabList>
            </TabLayout>

            {tabDefinitions.length > 0 ? (
              <Tabs>
                <TabPanels>
                  {tabDefinitions.map(tab => (
                    <TabPanel key={tab.key}>{tab.renderPanel()}</TabPanel>
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

export default PageContent;
