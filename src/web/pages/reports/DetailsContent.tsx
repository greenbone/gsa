/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import type Filter from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {isActive, TASK_STATUS} from 'gmp/models/task';
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
import useGetReportApplications from 'web/hooks/use-query/report-applications';
import useGetReportClosedCves from 'web/hooks/use-query/report-closed-cves';
import useGetReportCves from 'web/hooks/use-query/report-cves';
import useGetReportErrors from 'web/hooks/use-query/report-errors';
import useGetReportHosts from 'web/hooks/use-query/report-hosts';
import useGetReportOperatingSystems from 'web/hooks/use-query/report-operating-system';
import useGetReportPorts from 'web/hooks/use-query/report-ports';
import useGetReportTlsCertificates from 'web/hooks/use-query/report-tls-certificates';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ApplicationsTab from 'web/pages/reports/details/application/ApplicationsTab';
import ClosedCvesTab from 'web/pages/reports/details/cve/ClosedCvesTab';
import CvesTab from 'web/pages/reports/details/cve/CvesTab';
import DetailsToolbar from 'web/pages/reports/details/DetailsToolbar';
import ErrorsTab from 'web/pages/reports/details/error/ErrorsTab';
import HostsTabContent from 'web/pages/reports/details/host/HostsTabContent';
import OperatingSystemsTab from 'web/pages/reports/details/operating-system/OperatingSystemsTab';
import PortsTab from 'web/pages/reports/details/port/PortsTab';
import ResultsTabContent from 'web/pages/reports/details/result/ResultsTabContent';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';
import ThresholdPanel from 'web/pages/reports/details/ThresholdPanel';
import TLSCertificatesTab from 'web/pages/reports/details/tls-certificate/TlsCertificatesTab';

interface ThresholdConfig {
  showInitialLoading: boolean;
  showThresholdMessage: boolean;
  isUpdating: boolean;
  threshold: number;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
}

interface TabDefinition {
  key: string;
  renderTab: () => React.ReactNode;
  renderPanel: () => React.ReactNode;
}

interface PageContentProps {
  entity?: Report;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  isUpdating?: boolean;
  pageFilter?: Filter;
  reportError?: Error;
  reportFilter?: Filter;
  reportId: string;
  resetFilter?: Filter;
  resultsCounts?: {filtered?: number; full?: number};
  showError: (...args: unknown[]) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  task?: ReportTask;
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
  resultsCounts,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
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

  const {timestamp, scan_run_status} = report ?? {};

  const isImport = isDefined(task) && task.isImport();
  const status = isImport
    ? TASK_STATUS.import
    : (scan_run_status ?? TASK_STATUS.unknown);
  const refetchInterval = isActive(status) ? undefined : false;

  const {data: hostsData, isFetching: isHostsFetching} = useGetReportHosts({
    reportId,
    filter: reportFilter,
    refetchInterval,
  });
  const {data: portsData, isFetching: isPortsFetching} = useGetReportPorts({
    reportId,
    filter: reportFilter,
    refetchInterval,
  });
  const {data: applicationsData, isFetching: isApplicationsFetching} =
    useGetReportApplications({
      reportId,
      filter: reportFilter,
      refetchInterval,
    });
  const {data: operatingSystemsData, isFetching: isOperatingSystemsFetching} =
    useGetReportOperatingSystems({
      reportId,
      filter: reportFilter,
      refetchInterval,
    });
  const {data: cvesData, isFetching: isCvesFetching} = useGetReportCves({
    reportId,
    filter: reportFilter,
    refetchInterval,
  });
  const {data: closedCvesData, isFetching: isClosedCvesFetching} =
    useGetReportClosedCves({
      reportId,
      filter: reportFilter,
      refetchInterval,
    });
  const {data: tlsCertificatesData, isFetching: isTlsCertificatesFetching} =
    useGetReportTlsCertificates({
      reportId,
      filter: reportFilter,
      refetchInterval,
    });
  const {data: errorsData, isFetching: isErrorsFetching} = useGetReportErrors({
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

  const showThresholdMessage =
    !isLoading && hasReport && (resultsCounts?.filtered ?? 0) > threshold;

  const progress = task?.progress ?? 0;

  const showIsLoading = isLoading && !hasReport;

  const showInitialLoading =
    isLoading && !isDefined(reportError) && !showThresholdMessage;

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
      renderTab: () => (
        <TabTitle
          counts={
            resultsCounts
              ? {
                  filtered: resultsCounts.filtered ?? 0,
                  all: resultsCounts.full ?? 0,
                }
              : undefined
          }
          isLoading={isUpdating}
          title={_('Results')}
        />
      ),
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
      renderTab: () => (
        <TabTitle
          counts={hostsData?.entitiesCounts}
          isLoading={isHostsFetching}
          title={_('Hosts')}
        />
      ),
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
      renderTab: () => (
        <TabTitle
          counts={portsData?.entitiesCounts}
          isLoading={isPortsFetching}
          title={_('Ports')}
        />
      ),
      renderPanel: () => (
        <PortsTab
          reportFilter={activeFilter}
          reportId={reportId}
          status={status}
        />
      ),
    },
    {
      key: 'applications',
      renderTab: () => (
        <TabTitle
          counts={applicationsData?.entitiesCounts}
          isLoading={isApplicationsFetching}
          title={_('Applications')}
        />
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
          counts={operatingSystemsData?.entitiesCounts}
          isLoading={isOperatingSystemsFetching}
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
            operatingSystemsData={operatingSystemsData}
            isOperatingSystemsFetching={isOperatingSystemsFetching}
          />,
        ),
    },
    {
      key: 'cves',
      renderTab: () => (
        <TabTitle
          counts={cvesData?.entitiesCounts}
          isLoading={isCvesFetching}
          title={_('CVEs')}
        />
      ),
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
        <TabTitle
          counts={closedCvesData?.entitiesCounts}
          isLoading={isClosedCvesFetching}
          title={_('Closed CVEs')}
        />
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
          counts={tlsCertificatesData?.entitiesCounts}
          isLoading={isTlsCertificatesFetching}
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
        <TabTitle
          counts={errorsData?.entitiesCounts}
          isLoading={isErrorsFetching}
          title={_('Error Messages')}
        />
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
